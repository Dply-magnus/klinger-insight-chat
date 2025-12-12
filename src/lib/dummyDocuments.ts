import { Document, DocumentVersion } from "./documentTypes";

const createVersion = (
  id: string,
  filename: string,
  daysAgo: number,
  status: "active" | "pending" | "inactive"
): DocumentVersion => ({
  id,
  filename,
  uploadedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
  status,
});

export const dummyDocuments: Document[] = [
  {
    id: "doc1",
    title: "Ventil KHO",
    filename: "ventil_kho.pdf",
    storagePath: "documents/ventil_kho.pdf",
    category: "Produkter/Ventiler/Kulventiler",
    currentVersion: createVersion("v1-3", "ventil_kho.pdf", 1, "active"),
    versions: [
      createVersion("v1-3", "ventil_kho.pdf", 1, "active"),
      createVersion("v1-2", "ventil_kho.pdf", 15, "inactive"),
      createVersion("v1-1", "ventil_kho.pdf", 45, "inactive"),
    ],
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
  },
  {
    id: "doc2",
    title: "Ventil KHB",
    filename: "ventil_khb.pdf",
    storagePath: "documents/ventil_khb.pdf",
    category: "Produkter/Ventiler/Kulventiler",
    currentVersion: createVersion("v2-1", "ventil_khb.pdf", 3, "active"),
    versions: [
      createVersion("v2-1", "ventil_khb.pdf", 3, "active"),
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "doc3",
    title: "Flänsventil FV-200",
    filename: "flansventil_fv200.pdf",
    storagePath: "documents/flansventil_fv200.pdf",
    category: "Produkter/Ventiler/Flänsventiler",
    currentVersion: createVersion("v3-1", "flansventil_fv200.pdf", 7, "active"),
    versions: [
      createVersion("v3-1", "flansventil_fv200.pdf", 7, "active"),
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "doc4",
    title: "SIL C 4430 produktblad",
    filename: "sil-c-4430-produktblad.pdf",
    storagePath: "documents/sil-c-4430-produktblad.pdf",
    category: "Produkter/Packningar",
    currentVersion: createVersion("v4-1", "sil-c-4430-produktblad.pdf", 10, "active"),
    versions: [
      createVersion("v4-1", "sil-c-4430-produktblad.pdf", 10, "active"),
    ],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: "doc5",
    title: "KLINGER Quantum specifikation",
    filename: "klinger-quantum-spec.pdf",
    storagePath: "documents/klinger-quantum-spec.pdf",
    category: "Produkter/Packningar",
    currentVersion: createVersion("v5-2", "klinger-quantum-spec.pdf", 2, "pending"),
    versions: [
      createVersion("v5-2", "klinger-quantum-spec.pdf", 2, "pending"),
      createVersion("v5-1", "klinger-quantum-spec.pdf", 30, "inactive"),
    ],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: "doc6",
    title: "Installationsguide ventiler",
    filename: "installationsguide_ventiler.pdf",
    storagePath: "documents/installationsguide_ventiler.pdf",
    category: "Manualer/Installation",
    currentVersion: createVersion("v6-1", "installationsguide_ventiler.pdf", 14, "active"),
    versions: [
      createVersion("v6-1", "installationsguide_ventiler.pdf", 14, "active"),
    ],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: "doc7",
    title: "Underhållsmanual pumpar",
    filename: "underhall_pumpar.pdf",
    storagePath: "documents/underhall_pumpar.pdf",
    category: "Manualer/Underhåll",
    currentVersion: createVersion("v7-1", "underhall_pumpar.pdf", 21, "active"),
    versions: [
      createVersion("v7-1", "underhall_pumpar.pdf", 21, "active"),
    ],
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
  },
  {
    id: "doc8",
    title: "Kemikalieresistens tabell",
    filename: "kemikalieresistens-tabell.xlsx",
    storagePath: "documents/kemikalieresistens-tabell.xlsx",
    category: "Tekniska specifikationer",
    currentVersion: createVersion("v8-1", "kemikalieresistens-tabell.xlsx", 60, "inactive"),
    versions: [
      createVersion("v8-1", "kemikalieresistens-tabell.xlsx", 60, "inactive"),
    ],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  },
  {
    id: "doc9",
    title: "Gammal prislista 2023",
    filename: "prislista_2023.pdf",
    storagePath: "documents/prislista_2023.pdf",
    currentVersion: createVersion("v9-1", "prislista_2023.pdf", 180, "inactive"),
    versions: [
      createVersion("v9-1", "prislista_2023.pdf", 180, "inactive"),
    ],
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
  },
  {
    id: "doc10",
    title: "Produktkatalog 2024",
    filename: "produktkatalog_2024.pdf",
    storagePath: "documents/produktkatalog_2024.pdf",
    currentVersion: createVersion("v10-1", "produktkatalog_2024.pdf", 5, "active"),
    versions: [
      createVersion("v10-1", "produktkatalog_2024.pdf", 5, "active"),
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];