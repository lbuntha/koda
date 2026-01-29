// UserModal - Add/Edit user modal for Admin
import React, { useState, useEffect } from 'react';
import { X, Lock, Loader2 } from 'lucide-react';
import { User, Role, MenuItem } from '@types';
import { Button } from '@shared/components/ui';
import { getMenuItems, getUserMenuPermission, saveUserMenuPermission } from '@stores';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSave: (user: User) => void;
    currentAdminId?: string;
    isLoading?: boolean;
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user, onSave, currentAdminId = 'admin', isLoading = false }) => {
    const [formData, setFormData] = useState<Partial<User>>({
        name: '', email: '', role: Role.STUDENT, status: 'Active'
    });
    const [selectedMenuIds, setSelectedMenuIds] = useState<string[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [subscriptionTiers, setSubscriptionTiers] = useState<any[]>([]); // Using any for simplicity here to avoid full type import overhead issues, but ideally SubscriptionTier[]
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadMenuItems();
            loadConfig();
        }
    }, [isOpen]);

    const loadConfig = async () => {
        try {
            const { getSystemConfig } = await import('@stores');
            const config = await getSystemConfig();
            setSubscriptionTiers(config.subscriptionTiers);
        } catch (e) {
            console.error("Failed to load tiers", e);
        }
    };

    useEffect(() => {
        if (user) {
            setFormData(user);
            loadUserPermissions(user.id);
        } else {
            setFormData({ name: '', email: '', role: Role.STUDENT, status: 'Active' });
            setSelectedMenuIds([]);
        }
    }, [user, isOpen]);

    const loadMenuItems = async () => {
        setLoading(true);
        try {
            const items = await getMenuItems();
            setMenuItems(items);
        } catch (error) {
            console.error('Error loading menu items:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUserPermissions = async (userId: string) => {
        try {
            const permission = await getUserMenuPermission(userId);
            if (permission) {
                setSelectedMenuIds(permission.menuItemIds);
            } else {
                setSelectedMenuIds([]);
            }
        } catch (error) {
            console.error('Error loading user permissions:', error);
        }
    };

    if (!isOpen) return null;

    const togglePermission = (menuId: string) => {
        setSelectedMenuIds(prev =>
            prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const userId = user?.id || `user-${Date.now()}`;

        // Save user data
        const userData: User = {
            ...formData,
            id: userId,
            lastLogin: user?.lastLogin || 'Never',
            permissions: [] // Legacy field - we now use menuPermissions collection
        } as User;

        // Save menu permissions to Firebase if role has permissions
        if (formData.role === Role.TEACHER || formData.role === Role.ADMIN) {
            await saveUserMenuPermission(userId, selectedMenuIds, currentAdminId);
        }

        onSave(userData);
    };

    // Filter menu items by role category
    const getMenusForRole = (role: Role): MenuItem[] => {
        const roleCategory = role.toUpperCase() as MenuItem['category'];
        return menuItems.filter(item =>
            item.category === roleCategory || item.category === 'SHARED'
        );
    };

    const availableMenus = formData.role ? getMenusForRole(formData.role) : [];
    const showPermissions = formData.role === Role.TEACHER || formData.role === Role.ADMIN;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                    <h3 className="font-bold text-slate-800">{user ? 'Edit User' : 'Add New User'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 overflow-y-auto custom-scrollbar">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input
                            required
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                            <select
                                value={formData.role}
                                onChange={e => {
                                    setFormData({ ...formData, role: e.target.value as Role });
                                    setSelectedMenuIds([]); // Reset permissions on role change
                                }}
                                className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                {Object.values(Role).filter(r => r !== Role.NONE && r !== Role.ADMIN).map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                                <option value={Role.ADMIN}>ADMIN</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Suspended">Suspended</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Subscription Tier</label>
                            <select
                                value={formData.subscriptionTier || ''}
                                onChange={e => setFormData({ ...formData, subscriptionTier: e.target.value })}
                                className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="">Select Tier...</option>
                                {subscriptionTiers.map(tier => (
                                    <option key={tier.id} value={tier.id}>{tier.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            {/* Placeholder for future field */}
                        </div>
                    </div>

                    {/* Menu Permissions Section - Dynamic from Firebase */}
                    {showPermissions && (
                        <div className="mt-4 border-t border-slate-100 pt-4">
                            <label className="block text-sm font-medium text-slate-800 mb-3 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-indigo-500" />
                                Menu Permissions
                                <span className="text-xs text-slate-400 font-normal">
                                    ({selectedMenuIds.length} selected)
                                </span>
                            </label>

                            {loading ? (
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                </div>
                            ) : availableMenus.length === 0 ? (
                                <div className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-lg">
                                    No menu items configured for this role.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2 bg-slate-50 p-4 rounded-lg border border-slate-200 max-h-60 overflow-y-auto custom-scrollbar">
                                    {availableMenus.map(menu => (
                                        <label key={menu.id} className="flex items-start gap-3 cursor-pointer group p-2 hover:bg-white rounded-lg transition-colors">
                                            <div className="relative flex items-center mt-0.5">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMenuIds.includes(menu.id)}
                                                    onChange={() => togglePermission(menu.id)}
                                                    className="peer h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors block">
                                                    {menu.name}
                                                </span>
                                                <span className="text-xs text-slate-400 block truncate">
                                                    {menu.description}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {availableMenus.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedMenuIds(availableMenus.map(m => m.id))}
                                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                                    >
                                        Select All
                                    </button>
                                    <span className="text-slate-300">|</span>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedMenuIds([])}
                                        className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </form>
                <div className="p-4 md:p-6 pt-2 border-t border-slate-100 bg-white shrink-0 flex flex-col sm:flex-row justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={onClose} className="sm:w-auto w-full" disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSubmit} className="sm:w-auto w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {isLoading ? 'Saving...' : 'Save User'}
                    </Button>
                </div>
            </div >
        </div >
    );
};

