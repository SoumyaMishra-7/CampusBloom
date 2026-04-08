export const CURRENT_STUDENT = {
  id: "stu-001",
  name: "Aarav Sharma",
  department: "Computer Science"
};

function makePreviewSvg({ title, student, accent = "#4f46e5", background = "#eef2ff" }) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 620">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${background}" />
          <stop offset="100%" stop-color="#ffffff" />
        </linearGradient>
        <linearGradient id="line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${accent}" />
          <stop offset="100%" stop-color="#10b981" />
        </linearGradient>
      </defs>
      <rect width="900" height="620" rx="36" fill="url(#bg)" />
      <rect x="36" y="36" width="828" height="548" rx="28" fill="#fff" stroke="rgba(148,163,184,0.35)" />
      <rect x="78" y="82" width="190" height="18" rx="9" fill="${accent}" opacity="0.18" />
      <rect x="78" y="126" width="320" height="18" rx="9" fill="#cbd5e1" />
      <rect x="78" y="156" width="240" height="14" rx="7" fill="#e2e8f0" />
      <rect x="78" y="242" width="744" height="2" fill="url(#line)" />
      <circle cx="710" cy="174" r="58" fill="${accent}" opacity="0.12" />
      <circle cx="710" cy="174" r="38" fill="none" stroke="${accent}" stroke-width="10" />
      <text x="78" y="260" fill="#0f172a" font-family="Arial, sans-serif" font-size="42" font-weight="700">${title}</text>
      <text x="78" y="314" fill="#475569" font-family="Arial, sans-serif" font-size="24">Awarded to ${student}</text>
      <text x="78" y="372" fill="#64748b" font-family="Arial, sans-serif" font-size="20">CampusBloom verified achievement record</text>
      <rect x="78" y="444" width="240" height="64" rx="18" fill="#f8fafc" stroke="rgba(148,163,184,0.32)" />
      <text x="108" y="482" fill="#475569" font-family="Arial, sans-serif" font-size="18">Verified Document</text>
      <rect x="364" y="444" width="402" height="64" rx="18" fill="#f8fafc" stroke="rgba(148,163,184,0.32)" />
      <text x="392" y="482" fill="#475569" font-family="Arial, sans-serif" font-size="18">Digital Archive + Portfolio Ready</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const CURRENT_STUDENT_ID = CURRENT_STUDENT.id;

export const initialCertificates = [
  {
    id: "cert-1001",
    studentId: "stu-001",
    studentName: "Aarav Sharma",
    title: "National Robotics Challenge Winner",
    description: "Winner certificate from the national robotics championship with verified committee approval.",
    status: "pending",
    fileType: "PDF",
    fileName: "robotics-aarav.pdf",
    uploadedAt: "2026-04-03T10:20:00Z",
    updatedAt: "2026-04-03T10:20:00Z",
    previewUrl: makePreviewSvg({ title: "Robotics Winner", student: "Aarav Sharma", accent: "#4f46e5" })
  },
  {
    id: "cert-1002",
    studentId: "stu-001",
    studentName: "Aarav Sharma",
    title: "Inter-University Coding Sprint",
    description: "Participation and merit certificate for the spring hack sprint.",
    status: "approved",
    fileType: "Image",
    fileName: "coding-sprint-aarav.jpg",
    uploadedAt: "2026-04-01T14:05:00Z",
    updatedAt: "2026-04-02T09:30:00Z",
    previewUrl: makePreviewSvg({ title: "Coding Sprint", student: "Aarav Sharma", accent: "#10b981", background: "#ecfeff" })
  },
  {
    id: "cert-1003",
    studentId: "stu-001",
    studentName: "Aarav Sharma",
    title: "Campus Leadership Fellowship",
    description: "Re-submitted fellowship certificate pending review after metadata correction.",
    status: "rejected",
    fileType: "PDF",
    fileName: "leadership-aarav.pdf",
    uploadedAt: "2026-03-28T09:45:00Z",
    updatedAt: "2026-04-01T16:15:00Z",
    previewUrl: makePreviewSvg({ title: "Leadership Fellowship", student: "Aarav Sharma", accent: "#ef4444", background: "#fef2f2" })
  },
  {
    id: "cert-1004",
    studentId: "stu-002",
    studentName: "Diya Nair",
    title: "Inter-University Debate Finalist",
    description: "Finalist certificate for district-level debate competition.",
    status: "approved",
    fileType: "Image",
    fileName: "debate-diya.png",
    uploadedAt: "2026-04-02T12:10:00Z",
    updatedAt: "2026-04-02T12:10:00Z",
    previewUrl: makePreviewSvg({ title: "Debate Finalist", student: "Diya Nair", accent: "#f59e0b", background: "#fffbeb" })
  },
  {
    id: "cert-1005",
    studentId: "stu-003",
    studentName: "Rohan Mehta",
    title: "State Athletics Silver Medal",
    description: "State athletics silver medal certificate with event verification.",
    status: "pending",
    fileType: "Image",
    fileName: "athletics-rohan.jpg",
    uploadedAt: "2026-04-04T08:25:00Z",
    updatedAt: "2026-04-04T08:25:00Z",
    previewUrl: makePreviewSvg({ title: "Athletics Medal", student: "Rohan Mehta", accent: "#0ea5e9", background: "#eff6ff" })
  },
  {
    id: "cert-1006",
    studentId: "stu-004",
    studentName: "Sara Khan",
    title: "Community Impact Fellowship",
    description: "Community service fellowship certificate submitted for review.",
    status: "rejected",
    fileType: "PDF",
    fileName: "community-sara.pdf",
    uploadedAt: "2026-03-30T11:05:00Z",
    updatedAt: "2026-04-01T11:20:00Z",
    previewUrl: makePreviewSvg({ title: "Community Fellowship", student: "Sara Khan", accent: "#ef4444", background: "#fff1f2" })
  }
];

export function makeObjectPreview(file) {
  if (!file) return "";
  return URL.createObjectURL(file);
}
