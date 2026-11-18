import {
	createContext,
	FunctionComponent,
	PropsWithChildren,
	useContext,
	useMemo,
	useState,
} from "react";
import { RekorClient } from "rekor";

export interface RekorClientContext {
	client: RekorClient;
	baseUrl?: string;
	setBaseUrl: (base: string | undefined) => void;
	rekorV2API: boolean;
	setRekorV2API: (enabled: boolean) => void;
}

export const RekorClientContext = createContext<RekorClientContext | undefined>(
	undefined,
);

export const RekorClientProvider: FunctionComponent<PropsWithChildren<{}>> = ({
	children,
}) => {
	const [baseUrl, setBaseUrl] = useState<string>();
	const [rekorV2API, setRekorV2API] = useState<boolean>(false);

	const context: RekorClientContext = useMemo(() => {
		/*
		Using the Next.js framework, the NEXT_PUBLIC_REKOR_DEFAULT_DOMAIN env variable requires
		a NEXT_PUBLIC_* prefix to make the value of the variable accessible to the browser.
		Variables missing this prefix are only accessible in the Node.js environment.
		https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables
		*/
		if (baseUrl === undefined && process.env.NEXT_PUBLIC_REKOR_DEFAULT_DOMAIN) {
			setBaseUrl(process.env.NEXT_PUBLIC_REKOR_DEFAULT_DOMAIN);
		}

		return {
			client: new RekorClient({ BASE: baseUrl }),
			baseUrl,
			setBaseUrl,
			rekorV2API,
			setRekorV2API,
		};
	}, [baseUrl, rekorV2API]);

	return (
		<RekorClientContext.Provider value={context}>
			{children}
		</RekorClientContext.Provider>
	);
};

export function useRekorClient(): RekorClient {
	const ctx = useContext(RekorClientContext);

	if (!ctx) {
		throw new Error("Hook useRekorClient requires RekorClientContext.");
	}

	return ctx.client;
}

export function useRekorBaseUrl(): [
	RekorClientContext["baseUrl"],
	RekorClientContext["setBaseUrl"],
] {
	const ctx = useContext(RekorClientContext);

	if (!ctx) {
		throw new Error("Hook useRekorBaseUrl requires RekorClientContext.");
	}

	return [ctx.baseUrl, ctx.setBaseUrl];
}

export function useRekorV2API(): [
	RekorClientContext["rekorV2API"],
	RekorClientContext["setRekorV2API"],
] {
	const ctx = useContext(RekorClientContext);

	if (!ctx) {
		throw new Error("Hook useRekorV2API requires RekorClientContext.");
	}

	return [ctx.rekorV2API, ctx.setRekorV2API];
}
