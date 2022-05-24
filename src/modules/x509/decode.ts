import {
	AuthorityKeyIdentifierExtension,
	BasicConstraintsExtension,
	ExtendedKeyUsageExtension,
	KeyUsagesExtension,
	SubjectAlternativeNameExtension,
	SubjectKeyIdentifierExtension,
	X509Certificate,
} from "@peculiar/x509";
import { toRelativeDateString } from "../utils/date";

const UTF_8_DECODER = new TextDecoder("utf-8");

export function decodex509(rawCertificate: string) {
	const cert = new X509Certificate(rawCertificate);
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
		"X509v3 extensions": {} as any,
	};
	for (const ext of cert.extensions) {
		switch (ext.type) {
			case "2.5.29.17": {
				const sub = new SubjectAlternativeNameExtension(ext.rawData);
				decodedCert["X509v3 extensions"][
					`X509v3 Subject Alternative Name: ${ext.critical ? "critical" : ""}`
				] = {
					email: sub.email,
				};
				break;
			}
			case "2.5.29.15": {
				const usage = new KeyUsagesExtension(ext.rawData);
				decodedCert["X509v3 extensions"][
					`X509v3 Key Usage: ${ext.critical ? "critical" : ""}`
				] = [
					usage.usages === 1 ? "Digital Signature" : usage.usages.toString(),
				];
				break;
			}
			case "2.5.29.37": {
				const key = new ExtendedKeyUsageExtension(ext.rawData);
				decodedCert["X509v3 extensions"][
					`X509v3 Extended Key Usage: ${ext.critical ? "critical" : ""}`
				] = key.usages.map(code => {
					switch (code) {
						case "1.3.6.1.5.5.7.3.3":
							return "Code Signing";
						default:
							return code;
					}
				});
				break;
			}
			case "2.5.29.19": {
				const constraints = new BasicConstraintsExtension(ext.rawData);
				decodedCert["X509v3 extensions"][
					`X509v3 Basic Constraints: ${ext.critical ? "critical" : ""}`
				] = {
					CA: constraints.ca,
				};
				break;
			}
			case "2.5.29.14": {
				const subjectKey = new SubjectKeyIdentifierExtension(ext.rawData);
				decodedCert["X509v3 extensions"][
					`X509v3 Subject Key Identifier: ${ext.critical ? "critical" : ""}`
				] = [
					subjectKey.keyId
						.match(/.{1,2}/g)
						?.join(":")
						.toUpperCase(),
				];
				break;
			}
			case "2.5.29.35": {
				const authorityKey = new AuthorityKeyIdentifierExtension(ext.rawData);
				decodedCert["X509v3 extensions"][
					`X509v3 Authority Key Identifier: ${ext.critical ? "critical" : ""}`
				] = {
					keyid: authorityKey.keyId
						?.match(/.{1,2}/g)
						?.join(":")
						.toUpperCase(),
					certid: authorityKey.certId,
				};
				break;
			}
			default:
				const text = UTF_8_DECODER.decode(ext.value);
				decodedCert["X509v3 extensions"][
					`${ext.type}: ${ext.critical ? "critical" : ""}`
				] = [text];
		}
	}
	return decodedCert;
}
