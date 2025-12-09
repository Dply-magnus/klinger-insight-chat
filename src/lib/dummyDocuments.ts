import { Document, DocumentVersion } from "./documentTypes";

const createVersion = (
  id: string,
  filename: string,
  daysAgo: number,
  status: "active" | "pending" | "inactive" | "deleted"
): DocumentVersion => ({
  id,
  filename,
  uploadedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
  status,
});

export const dummyDocuments: Document[] = [
  {
    id: "doc1",
    title: "Produktblad Alfa",
    filename: "produkt_alfa.pdf",
    currentVersion: createVersion("v1-3", "produkt_alfa.pdf", 1, "active"),
    versions: [
      createVersion("v1-3", "produkt_alfa.pdf", 1, "active"),
      createVersion("v1-2", "produkt_alfa.pdf", 15, "inactive"),
      createVersion("v1-1", "produkt_alfa.pdf", 45, "inactive"),
    ],
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
  },
  {
    id: "doc2",
    title: "KLINGER Quantum specifikation",
    filename: "klinger-quantum-spec.pdf",
    currentVersion: createVersion("v2-1", "klinger-quantum-spec.pdf", 3, "active"),
    versions: [
      createVersion("v2-1", "klinger-quantum-spec.pdf", 3, "active"),
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "doc3",
    title: "Installationsguide ventiler",
    filename: "installationsguide_ventiler.pdf",
    currentVersion: createVersion("v3-2", "installationsguide_ventiler.pdf", 0, "pending"),
    versions: [
      createVersion("v3-2", "installationsguide_ventiler.pdf", 0, "pending"),
      createVersion("v3-1", "installationsguide_ventiler.pdf", 30, "inactive"),
    ],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: "doc4",
    title: "Kemikalieresistens tabell",
    filename: "kemikalieresistens-tabell.pdf",
    currentVersion: createVersion("v4-1", "kemikalieresistens-tabell.pdf", 60, "inactive"),
    versions: [
      createVersion("v4-1", "kemikalieresistens-tabell.pdf", 60, "inactive"),
    ],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  },
  {
    id: "doc5",
    title: "Gammal prislista 2023",
    filename: "prislista_2023.pdf",
    currentVersion: createVersion("v5-1", "prislista_2023.pdf", 180, "deleted"),
    versions: [
      createVersion("v5-1", "prislista_2023.pdf", 180, "deleted"),
    ],
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
  },
  {
    id: "doc6",
    title: "SIL C 4430 produktblad",
    filename: "sil-c-4430-produktblad.pdf",
    currentVersion: createVersion("v6-1", "sil-c-4430-produktblad.pdf", 7, "active"),
    versions: [
      createVersion("v6-1", "sil-c-4430-produktblad.pdf", 7, "active"),
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];
