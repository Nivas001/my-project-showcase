export type Certificate = {
  id: string;
  title: string;
  issuer: string;
  issued_on: string;
  credential_url: string | null;
  images: string[];
  sort_order: number;
};

export type CertificateInput = Omit<Certificate, "id"> & { id?: string };

export const CERTIFICATE_COLUMNS =
  "id, title, issuer, issued_on, credential_url, images, sort_order";

export const emptyCertificate: CertificateInput = {
  title: "",
  issuer: "",
  issued_on: "",
  credential_url: null,
  images: [],
  sort_order: 0,
};
