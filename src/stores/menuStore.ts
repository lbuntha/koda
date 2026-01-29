// Menu Store - Manages menu items and permissions in Firebase
import { MenuItem, MenuPermission, DEFAULT_MENU_ITEMS } from '@types';
import { getAll, save, saveAll, remove } from '@lib/index';

const MENU_COLLECTION = 'menuItems' as const;
const PERMISSION_COLLECTION = 'menuPermissions' as const;

// ==================== MENU ITEMS ====================

export const getMenuItems = async (): Promise<MenuItem[]> => {
    const items = await getAll<MenuItem>(MENU_COLLECTION);
    if (items.length === 0) {
        // Seed default menu items
        const seededItems = await seedDefaultMenuItems();
        return seededItems;
    }
    return items.sort((a, b) => a.order - b.order);
};

export const seedDefaultMenuItems = async (): Promise<MenuItem[]> => {
    const now = Date.now();
    const items: MenuItem[] = DEFAULT_MENU_ITEMS.map((item, index) => ({
        ...item,
        id: `menu-${item.code.toLowerCase().replace(/_/g, '-')}-${index}`,
        createdAt: now,
        updatedAt: now,
    }));
    await saveAll(MENU_COLLECTION, items);
    return items;
};

export const getMenuItemsByCategory = async (category: MenuItem['category']): Promise<MenuItem[]> => {
    const items = await getMenuItems();
    return items.filter(item => item.category === category && item.isActive);
};

export const saveMenuItem = async (item: MenuItem): Promise<void> => {
    const updatedItem = { ...item, updatedAt: Date.now() };
    await save(MENU_COLLECTION, updatedItem);
};

export const addMenuItem = async (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> => {
    const now = Date.now();
    const newItem: MenuItem = {
        ...item,
        id: `menu-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
    };
    await save(MENU_COLLECTION, newItem);
    return newItem;
};

export const deleteMenuItem = async (id: string): Promise<void> => {
    await remove(MENU_COLLECTION, id);
};

// ==================== MENU PERMISSIONS ====================

export const getMenuPermissions = async (): Promise<MenuPermission[]> => {
    return await getAll<MenuPermission>(PERMISSION_COLLECTION);
};

export const getUserMenuPermission = async (userId: string): Promise<MenuPermission | null> => {
    const permissions = await getMenuPermissions();
    return permissions.find(p => p.userId === userId) || null;
};

export const saveUserMenuPermission = async (
    userId: string,
    menuItemIds: string[],
    grantedBy: string
): Promise<void> => {
    const existing = await getUserMenuPermission(userId);

    const permission: MenuPermission = {
        id: existing?.id || `perm-${userId}`,
        userId,
        menuItemIds,
        grantedBy,
        grantedAt: Date.now(),
    };

    await save(PERMISSION_COLLECTION, permission);
};

export const deleteUserMenuPermission = async (userId: string): Promise<void> => {
    const permission = await getUserMenuPermission(userId);
    if (permission) {
        await remove(PERMISSION_COLLECTION, permission.id);
    }
};

// ==================== HELPER FUNCTIONS ====================

// Get menu items a user has access to
export const getUserAccessibleMenus = async (userId: string, role: string): Promise<MenuItem[]> => {
    const allMenus = await getMenuItems();
    const userPermission = await getUserMenuPermission(userId);

    // If user has explicit permissions, use them
    if (userPermission && userPermission.menuItemIds.length > 0) {
        return allMenus.filter(menu =>
            userPermission.menuItemIds.includes(menu.id) && menu.isActive
        );
    }

    // Otherwise, return menus matching user's role category
    const roleCategory = role.toUpperCase() as MenuItem['category'];
    return allMenus.filter(menu =>
        (menu.category === roleCategory || menu.category === 'SHARED') && menu.isActive
    );
};

// Check if user has access to a specific menu
export const hasMenuAccess = async (userId: string, menuCode: string): Promise<boolean> => {
    const userPermission = await getUserMenuPermission(userId);
    const allMenus = await getMenuItems();

    const menu = allMenus.find(m => m.code === menuCode);
    if (!menu || !menu.isActive) return false;

    if (userPermission && userPermission.menuItemIds.length > 0) {
        return userPermission.menuItemIds.includes(menu.id);
    }

    return true; // Default: allow if no explicit restrictions
};

// Bulk update menu permissions for a user
export const updateUserPermissions = async (
    userId: string,
    menuCodes: string[],
    grantedBy: string
): Promise<void> => {
    const allMenus = await getMenuItems();
    const menuItemIds = allMenus
        .filter(m => menuCodes.includes(m.code))
        .map(m => m.id);

    await saveUserMenuPermission(userId, menuItemIds, grantedBy);
};

// Get permission codes for a user (for backward compatibility with string[] permissions)
export const getUserPermissionCodes = async (userId: string): Promise<string[]> => {
    const permission = await getUserMenuPermission(userId);
    if (!permission) return [];

    const allMenus = await getMenuItems();
    return allMenus
        .filter(m => permission.menuItemIds.includes(m.id))
        .map(m => m.code);
};
