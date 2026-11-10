// Certification quizzes for the recorded courses. Kept on the server so the
// answers never reach the browser and a pass can't be faked.

const EXCEL_QUIZ = [
    { question: "What is MS Excel?", options: ["Word processor", "Spreadsheet software", "Browser", "Game"], answer: 1 },
    { question: "What is the default file extension of Excel?", options: [".docx", ".xlsx", ".pptx", ".txt"], answer: 1 },
    { question: "A cell in Excel is formed by:", options: ["Row only", "Row and column intersection", "Column only", "Sheet only"], answer: 1 },
    { question: "Which key is used to select all data?", options: ["Ctrl + C", "Ctrl + A", "Ctrl + V", "Ctrl + X"], answer: 1 },
    { question: "What is a workbook?", options: ["Single cell", "Collection of worksheets", "Chart only", "Formula"], answer: 1 },
    { question: "Which symbol is used to start a formula?", options: ["#", "=", "@", "&"], answer: 1 },
    { question: "What is a row in Excel?", options: ["Vertical line", "Horizontal line", "Box", "Table"], answer: 1 },
    { question: "What is a column in Excel?", options: ["Horizontal line", "Vertical line", "Row", "Cell"], answer: 1 },
    { question: "Which shortcut is used to copy?", options: ["Ctrl + V", "Ctrl + C", "Ctrl + X", "Ctrl + Z"], answer: 1 },
    { question: "Which option is used to paste?", options: ["Ctrl + C", "Ctrl + V", "Ctrl + X", "Ctrl + A"], answer: 1 }
];

const POWER_BI_QUIZ = [
    { question: "What is Power BI mainly used for?", options: ["Editing videos", "Data visualization and reporting", "Writing documents", "Sending emails"], answer: 1 },
    { question: "Which tool inside Power BI is used to clean and shape data?", options: ["Power Query", "Paint", "Slide Sorter", "Mail Merge"], answer: 0 },
    { question: "What is the file extension of a Power BI Desktop file?", options: [".xlsx", ".docx", ".pbix", ".pptx"], answer: 2 },
    { question: "Which language is used to write measures in Power BI?", options: ["HTML", "DAX", "CSS", "Java"], answer: 1 },
    { question: "What does a relationship connect in a data model?", options: ["Two tables", "Two charts", "Two fonts", "Two pages"], answer: 0 },
    { question: "Which visual lets a viewer filter a report page?", options: ["Text box", "Image", "Slicer", "Shape"], answer: 2 },
    { question: "Which visual is best for showing a trend over time?", options: ["Line chart", "Pie chart", "Card", "Table"], answer: 0 },
    { question: "What does a Card visual usually display?", options: ["A map", "A single key number", "A long list", "A photo"], answer: 1 },
    { question: "In a star schema, which table holds the measurable values?", options: ["Dimension table", "Fact table", "Calendar only", "Theme table"], answer: 1 },
    { question: "What is the Power BI Service used for?", options: ["Publishing and sharing reports online", "Typing letters", "Editing photos", "Recording audio"], answer: 0 }
];

const GEN_AI_QUIZ = [
    { question: "What does Generative AI do?", options: ["Only stores files", "Creates new content like text and images", "Only repairs hardware", "Only blocks viruses"], answer: 1 },
    { question: "What is a prompt?", options: ["The instruction you give an AI tool", "A computer cable", "A type of virus", "A file format"], answer: 0 },
    { question: "Which of these is an AI chat assistant?", options: ["Notepad", "Calculator", "ChatGPT", "Paint"], answer: 2 },
    { question: "How do you usually get a better answer from an AI tool?", options: ["Use fewer details", "Give clear context and instructions", "Type in capitals", "Restart the computer"], answer: 1 },
    { question: "What does 'hallucination' mean in AI?", options: ["The AI states something false with confidence", "The screen flickers", "The app closes", "The file gets bigger"], answer: 0 },
    { question: "What should you do with important facts from an AI answer?", options: ["Share them right away", "Delete them", "Verify them from a reliable source", "Ignore all of them"], answer: 2 },
    { question: "What does a text-to-image tool do?", options: ["Prints documents", "Creates an image from a written description", "Scans barcodes", "Compresses photos"], answer: 1 },
    { question: "Which information should you avoid pasting into public AI tools?", options: ["Private or confidential data", "A public news headline", "A recipe name", "A general question"], answer: 0 },
    { question: "What does LLM stand for?", options: ["Long Link Manager", "Large Language Model", "Local Logic Machine", "Live Learning Mode"], answer: 1 },
    { question: "How should AI be used at work?", options: ["Never check its output", "Replace all thinking", "As an assistant, with human review", "Only for games"], answer: 2 }
];

const PASS_MARK = 70;

// The live cohort records double as the recorded courses, so the certificate
// names the course subject rather than the cohort title.
const quizFor = (title = '') => {
    const name = title.toLowerCase();
    if (name.includes('power bi')) return { courseName: 'Power BI Data Visualization', questions: POWER_BI_QUIZ };
    if (name.includes('gen ai')) return { courseName: 'Gen AI Tools Mastery', questions: GEN_AI_QUIZ };
    if (name.includes('excel')) return { courseName: 'MS Excel with Generative AI', questions: EXCEL_QUIZ };
    return null;
};

// Percentage of correct answers. Missing or malformed answers count as wrong.
const gradeQuiz = (questions, answers) => {
    const given = Array.isArray(answers) ? answers : [];
    const correct = questions.filter((q, i) => given[i] === q.answer).length;
    return Math.round((correct / questions.length) * 100);
};

module.exports = { quizFor, gradeQuiz, PASS_MARK };
