export const recordTypes = {
  requirement: ["Permit / licence", "Safety requirement", "Environmental requirement", "Client / contract requirement", "Internal procedure", "Other requirement"],
  employee: ["Employee profile", "Safety induction", "HSE training", "First aid training", "Fire safety training", "Working at height training", "Confined space training", "Equipment operator qualification", "Professional qualification", "Medical fitness", "Other people / training record"],
  asset: ["Crane / lifting equipment", "Lifting accessories / rigging", "Forklift / material handling", "Pressure vessel / air receiver", "Boiler", "Fire protection equipment", "Electrical equipment", "Generator", "Gas detector", "Measuring / calibration instrument", "Scaffolding / access equipment", "Vehicle / mobile plant", "Other equipment"],
  document: ["Equipment inspection certificate", "Calibration certificate", "Training certificate", "Operating permit / licence", "Insurance document", "Safety data sheet", "Other certificate / permit"],
  inspection: ["Equipment inspection", "Lifting equipment inspection", "Fire safety inspection", "Electrical inspection", "Site safety inspection", "Environmental inspection", "Internal audit", "Other inspection"],
  action: ["Inspection finding", "Audit finding", "Incident follow-up", "Equipment defect", "Training gap", "Expired / missing evidence", "Other corrective action"],
  service: ["Equipment inspection", "Calibration", "Training", "Testing / analysis", "Maintenance / repair", "Compliance consultancy", "Other service"],
} as const;
export type RecordKind = keyof typeof recordTypes;
export const typeFieldLabels: Record<RecordKind, string> = {
  requirement: "Requirement type", employee: "People / training type", asset: "Equipment type",
  document: "Certificate / permit type", inspection: "Inspection type", action: "Corrective action type", service: "Service type",
};
export function isRecordType(kind: string, value: string): boolean {
  return Object.hasOwn(recordTypes, kind) && (recordTypes[kind as RecordKind] as readonly string[]).includes(value);
}
