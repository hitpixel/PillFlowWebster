export interface Patient {
  id: string;
  name: string;
  avatar: string;
  lastCollection: string;
  status: "active" | "inactive";
  collectionsCompleted: number;
  totalCollections: number;
  packs: {
    id: string;
    name: string;
    time: string;
  }[];
}

export let patients: Patient[] = [
  {
    id: "PAT-1234",
    name: "John Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    lastCollection: "3 days ago",
    status: "active",
    collectionsCompleted: 6,
    totalCollections: 8,
    packs: [
      { id: "WP-1234", name: "Morning", time: "Today, 10:23 AM" },
      { id: "WP-1235", name: "Evening", time: "Yesterday, 4:15 PM" },
    ],
  },
  {
    id: "PAT-5678",
    name: "Mary Smith",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mary",
    lastCollection: "1 week ago",
    status: "active",
    collectionsCompleted: 2,
    totalCollections: 8,
    packs: [
      { id: "WP-5678", name: "Evening", time: "Today, 09:15 AM" },
      { id: "WP-5679", name: "Morning", time: "Last week, 11:30 AM" },
    ],
  },
];

// Function to add a new patient
export const addPatient = (patientData: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}) => {
  const newPatient: Patient = {
    id: `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
    name: patientData.name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${patientData.name.replace(/ /g, "")}`,
    lastCollection: "Never",
    status: "active",
    collectionsCompleted: 0,
    totalCollections: 0,
    packs: [],
  };

  patients = [newPatient, ...patients];
  return newPatient;
};
