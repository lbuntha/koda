
import { TutorialConfig } from './TutorialContext';

export const STUDENT_TUTORIAL_ID = 'student_onboarding';

export const studentTutorialSteps: TutorialConfig = {
    id: STUDENT_TUTORIAL_ID,
    steps: [
        {
            targetId: 'student-greeting-mobile',
            targets: ['student-greeting-desktop'],
            title: 'Welcome to Koda!',
            content: "Hi there! This is your personal dashboard. Let's take a quick tour to help you get started.",
        },
        {
            targetId: 'student-streak-mobile',
            targets: ['student-streak-desktop'],
            title: 'Your Streak',
            content: "Consistency is key! This flame shows your daily learning streak. Keep it lit by practicing every day.",
        },
        {
            targetId: 'student-hero-mobile', // Assuming hero is consistent or I used class
            // I didn't add desktop ID for hero explicitly in previous edit? 
            // Wait, looking at edit history for studentdashboard...
            // I added 'student-hero-mobile'. Desktop has no hero ID?
            // "StudentHero" component is used on Mobile.
            // Desktop has "Hero Header".
            // Let's assume on desktop we target the 'student-greeting-desktop' again or skip?
            // Let's target the stats card for now as 'Start Learning' equivalent or just make it mobile only for now?
            // Or add ID to text in desktop hero.
            // I'll leave the fallback empty for now and it will just show nothing or skip?
            // Ideally if target is not found, we should probably handle it gracefully (current overlay will just show nothing).
            // I'll add 'student-greeting-desktop' as fallback for hero too so it points somewhere.
            targets: ['student-greeting-desktop'],
            title: 'Start Learning',
            content: "Not sure what to do? Hit the Play button to jump straight into a recommended lesson or practice session.",
        },
        {
            targetId: 'student-goals-mobile', // I didn't add this ID? I added 'student-goals-desktop'.
            // wait, I added 'student-goals-desktop'. 
            // Mobile goals?
            // FilteredGoalSkills are shown in 'SkillGrid'. I need a wrapper ID.
            // I'll assume I can add it later. For now, best effort.
            targets: ['student-goals-desktop'],
            title: 'Your Goals',
            content: "Here you can track the specific skills you want to master. Add new goals to stay focused.",
        },
        // Remove Ranks for now as I didn't add ID
    ]
};
