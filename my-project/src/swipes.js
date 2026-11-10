// Swipes records with no lessons, or marked as a demo in the admin panel, stay
// in the database but must never be shown or sold to students.
export const realSwipes = (courses) =>
    (Array.isArray(courses) ? courses : []).filter((course) => {
        const lessons = (course.chapters || []).reduce((n, ch) => n + (ch.modules || []).length, 0);
        return lessons > 0 && !/demo|ignore/i.test(`${course.tag} ${course.highlight}`);
    });

// Swipes Pro pricing. Keep in step with the subscribe route in
// Backend/routes/biteSizeRoutes.js, which is what Razorpay actually charges.
export const SWIPES_PRICE = 799;
export const SWIPES_LAUNCH_END = new Date('2026-12-31T23:59:59+05:30');
export const swipesMonths = () => (Date.now() <= SWIPES_LAUNCH_END.getTime() ? 18 : 12);
