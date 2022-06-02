import { KeyUsageFlags } from "@peculiar/x509";

export const KEY_USAGE_NAMES: Record<KeyUsageFlags, string> = {
	[KeyUsageFlags.digitalSignature]: "Digital Signature",
	[KeyUsageFlags.nonRepudiation]: "Non Repudiation",
	[KeyUsageFlags.keyEncipherment]: "Key Encipherment",
	[KeyUsageFlags.dataEncipherment]: "Data Encipherment",
	[KeyUsageFlags.keyAgreement]: "Key Agreement",
	[KeyUsageFlags.keyCertSign]: "Key Certificate Sign",
	[KeyUsageFlags.cRLSign]: "Certificate Revocation List Sign",
	[KeyUsageFlags.encipherOnly]: "Encipher Only",
	[KeyUsageFlags.decipherOnly]: "Decipher Only",
};
