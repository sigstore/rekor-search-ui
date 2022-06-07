import { X509Certificate } from "@peculiar/x509";
import { toRelativeDateString } from "../utils/date";
import { EXTENSIONS_CONFIG } from "./extensions";

function bufferToHex(buffer: ArrayBuffer): string {
	return [...new Uint8Array(buffer)]
		.map(x => x.toString(16).padStart(2, "0"))
		.join(":");
}

export function decodex509(rawCertificate: string) {
	const cert = new X509Certificate(rawCertificate);

	const decodedExtensions: Record<string, {}> = {};
	for (const extension of cert.extensions) {
		const criticalLabel = extension.critical ? " (critical)" : "";

		const config = EXTENSIONS_CONFIG[extension.type];
		if (config) {
			decodedExtensions[`${config.name}${criticalLabel}`] =
				config.toJSON(extension);
		} else {
			const text = bufferToHex(extension.value);
			decodedExtensions[`${extension.type}${criticalLabel}`] = text;
		}
	}

	const decodedCert = {
		data: {
			"Serial Number": `0x${cert.serialNumber}`,
		},
		Signature: {
			Issuer: cert.issuer,
			Validity: {
				"Not Before": toRelativeDateString(cert.notBefore),
				"Not After": toRelativeDateString(cert.notAfter),
			},
			Algorithm: cert.publicKey.algorithm,
			Subject: cert.subjectName,
		},
		"X509v3 extensions": decodedExtensions,
	};
	return decodedCert;
}
