// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

Object.assign(global, { TextDecoder, TextEncoder });
