import {
	AuthorityKeyIdentifierExtension,
	BasicConstraintsExtension,
	ExtendedKeyUsageExtension,
	Extension,
	KeyUsageFlags,
	KeyUsagesExtension,
	SubjectAlternativeNameExtension,
	SubjectKeyIdentifierExtension,
} from "@peculiar/x509";
import { KEY_USAGE_NAMES } from "./constants";

interface ExtensionConfig {
	name: string;
	toJSON: (rawExtension: Extension) => {};
}

const UTF_8_DECODER = new TextDecoder("utf-8");
function textDecoder(rawExtension: Extension) {
	return UTF_8_DECODER.decode(rawExtension.value);
}

/**
 * Map from OID to Extension
 */
export const EXTENSIONS_CONFIG: Record<string, ExtensionConfig> = {
	"2.5.29.14": {
		name: "Subject Key Identifier",
		toJSON(rawExtension: Extension) {
			const ext = new SubjectKeyIdentifierExtension(rawExtension.rawData);
			return [
				ext.keyId
					.match(/.{1,2}/g)
					?.join(":")
					.toUpperCase(),
			];
		},
	},
	"2.5.29.15": {
		name: "Key Usage",
		toJSON(rawExtension: Extension) {
			const ext = new KeyUsagesExtension(rawExtension.rawData);
			const usages: string[] = [];

			const keys = Object.keys(KEY_USAGE_NAMES) as unknown as KeyUsageFlags[];
			for (const key of keys) {
				if (ext.usages & key) {
					usages.push(KEY_USAGE_NAMES[key]);
				}
			}
			return usages;
		},
	},
	"2.5.29.17": {
		name: "Subject Alternative Name",
		toJSON(rawExtension: Extension) {
			return new SubjectAlternativeNameExtension(rawExtension.rawData).toJSON();
		},
	},
	"2.5.29.19": {
		name: "Basic Constraints",
		toJSON(rawExtension: Extension) {
			const ext = new BasicConstraintsExtension(rawExtension.rawData);
			return {
				CA: ext.ca,
			};
		},
	},
	"2.5.29.35": {
		name: "Authority Key Identifier",
		toJSON(rawExtension: Extension) {
			const ext = new AuthorityKeyIdentifierExtension(rawExtension.rawData);
			return {
				keyid: ext.keyId
					?.match(/.{1,2}/g)
					?.join(":")
					.toUpperCase(),
				certid: ext.certId,
			};
		},
	},
	"2.5.29.37": {
		name: "Extended Key Usage",
		toJSON(rawExtension: Extension) {
			const ext = new ExtendedKeyUsageExtension(rawExtension.rawData);
			return ext.usages.map(code => {
				switch (code) {
					case "1.3.6.1.5.5.7.3.3":
						return "Code Signing";
					default:
						return code;
				}
			});
		},
	},
	/**
	 * Fulcio OIDs are based on https://github.com/sigstore/fulcio/tree/main/pkg/ca/x509ca/extensions.go
	 */
	"1.3.6.1.4.1.57264.1.1": {
		name: "OIDC Issuer",
		toJSON: textDecoder,
	},
	"1.3.6.1.4.1.57264.1.2": {
		name: "GitHub Workflow Trigger",
		toJSON: textDecoder,
	},
	"1.3.6.1.4.1.57264.1.3": {
		name: "GitHub Workflow SHA",
		toJSON: textDecoder,
	},
	"1.3.6.1.4.1.57264.1.4": {
		name: "GitHub Workflow Name",
		toJSON: textDecoder,
	},
	"1.3.6.1.4.1.57264.1.5": {
		name: "GitHub Workflow Repository",
		toJSON: textDecoder,
	},
	"1.3.6.1.4.1.57264.1.6": {
		name: "GitHub Workflow Ref",
		toJSON: textDecoder,
	},
};
