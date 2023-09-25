import { AsnAnyConverter, AsnUtf8StringConverter } from "@peculiar/asn1-schema";
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
function textDecoder(rawExtension: Extension): string {
	return UTF_8_DECODER.decode(rawExtension.value);
}

function utf8StringDecoder(rawExtension: Extension): string {
	return AsnUtf8StringConverter.fromASN(
		AsnAnyConverter.toASN(rawExtension.value),
	);
}

/**
 * Map from OID to Extension
 *
 * TODO: Migrate to x509 textual representation introduced in PeculiarVentures/x509#48.
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
	 * Fulcio OIDs are based on https://github.com/sigstore/fulcio/blob/main/pkg/ca/extensions.go
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
	"1.3.6.1.4.1.57264.1.8": {
		name: "OIDC Issuer (v2)",
		toJSON: utf8StringDecoder,
	},
	"1.3.6.1.4.1.57264.1.9": {
		name: "Build Signer URI",
		toJSON: utf8StringDecoder,
	},
	"1.3.6.1.4.1.57264.1.10": {
		name: "Build Signer Digest",
		toJSON: utf8StringDecoder,
	},
	"1.3.6.1.4.1.57264.1.11": {
		name: "Runner Environment",
		toJSON: utf8StringDecoder,
	},
	"1.3.6.1.4.1.57264.1.12": {
		name: "Source Repository URI",
		toJSON: utf8StringDecoder,
	},
	"1.3.6.1.4.1.57264.1.13": {
		name: "Source Repository Digest",
		toJSON: utf8StringDecoder,
	},
	"1.3.6.1.4.1.57264.1.14": {
		name: "Source Repository Ref",
		toJSON: utf8StringDecoder,
	},
	"1.3.6.1.4.1.57264.1.15": {
		name: "Source Repository Identifier",
		toJSON: utf8StringDecoder,
	},
	"1.3.6.1.4.1.57264.1.16": {
		name: "Source Repository Owner URI",
		toJSON: utf8StringDecoder,
	},
	"1.3.6.1.4.1.57264.1.17": {
		name: "Source Repository Owner Identifier",
		toJSON: utf8StringDecoder,
	},
	"1.3.6.1.4.1.57264.1.18": {
		name: "Build Config URI",
		toJSON: utf8StringDecoder,
	},
	"1.3.6.1.4.1.57264.1.19": {
		name: "Build Config Digest",
		toJSON: utf8StringDecoder,
	},
	"1.3.6.1.4.1.57264.1.20": {
		name: "Build Trigger",
		toJSON: utf8StringDecoder,
	},
	"1.3.6.1.4.1.57264.1.21": {
		name: "Run Invocation URI",
		toJSON: utf8StringDecoder,
	},
	"1.3.6.1.4.1.57264.1.22": {
		name: "Source Repository Visibility At Signing",
		toJSON: utf8StringDecoder,
	},
};
