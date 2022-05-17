// To parse this data:
//
//   import { Convert, Jar } from "./file";
//
//   const jar = Convert.toJar(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

/**
 * Schema for JAR entries
 */
export interface Jar {
    /**
     * Information about the archive associated with the entry
     */
    archive: Archive;
    /**
     * Information about the included signature in the JAR file
     */
    signature?: Signature;
}

/**
 * Information about the archive associated with the entry
 */
export interface Archive {
    /**
     * Specifies the archive inline within the document
     */
    content?: string;
    /**
     * Specifies the hash algorithm and value encompassing the entire signed archive
     */
    hash?: Hash;
}

/**
 * Specifies the hash algorithm and value encompassing the entire signed archive
 */
export interface Hash {
    /**
     * The hashing function used to compute the hash value
     */
    algorithm: Algorithm;
    /**
     * The hash value for the archive
     */
    value: string;
}

/**
 * The hashing function used to compute the hash value
 */
export enum Algorithm {
    Sha256 = "sha256",
}

/**
 * Information about the included signature in the JAR file
 */
export interface Signature {
    /**
     * Specifies the PKCS7 signature embedded within the JAR file
     */
    content: string;
    /**
     * The X509 certificate containing the public key JAR which verifies the signature of the JAR
     */
    publicKey: PublicKey;
}

/**
 * The X509 certificate containing the public key JAR which verifies the signature of the JAR
 */
export interface PublicKey {
    /**
     * Specifies the content of the X509 certificate containing the public key used to verify
     * the signature
     */
    content: string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toJar(json: string): Jar {
        return cast(JSON.parse(json), r("Jar"));
    }

    public static jarToJson(value: Jar): string {
        return JSON.stringify(uncast(value, r("Jar")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`, );
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases, val);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val);
    }
    if (typ === false) return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "Jar": o([
        { json: "archive", js: "archive", typ: r("Archive") },
        { json: "signature", js: "signature", typ: u(undefined, r("Signature")) },
    ], "any"),
    "Archive": o([
        { json: "content", js: "content", typ: u(undefined, "") },
        { json: "hash", js: "hash", typ: u(undefined, r("Hash")) },
    ], "any"),
    "Hash": o([
        { json: "algorithm", js: "algorithm", typ: r("Algorithm") },
        { json: "value", js: "value", typ: "" },
    ], "any"),
    "Signature": o([
        { json: "content", js: "content", typ: "" },
        { json: "publicKey", js: "publicKey", typ: r("PublicKey") },
    ], "any"),
    "PublicKey": o([
        { json: "content", js: "content", typ: "" },
    ], "any"),
    "Algorithm": [
        "sha256",
    ],
};
