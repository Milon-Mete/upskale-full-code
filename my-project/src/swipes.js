// Swipes records with no lessons, or marked as a demo in the admin panel, stay
// in the database but must never be shown or sold to students.
export const realSwipes = (courses) =>
    (Array.isArray(courses) ? courses : []).filter((course) => {
        const lessons = (course.chapters || []).reduce((n, ch) => n + (ch.modules || []).length, 0);
        return lessons > 0 && !/demo|ignore/i.test(`${course.tag} ${course.highlight}`);
    });
