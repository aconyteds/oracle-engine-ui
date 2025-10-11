import { describe, expect, test } from "vitest";
import client, { setAuthToken } from "./apolloClient";

describe("apolloClient", () => {
    test("should export Apollo Client instance", () => {
        expect(client).toBeDefined();
        expect(client.cache).toBeDefined();
        expect(client.link).toBeDefined();
    });

    test("should have InMemoryCache", () => {
        expect(client.cache).toBeDefined();
        expect(client.cache.constructor.name).toBe("InMemoryCache");
    });

    test("should export setAuthToken function", () => {
        expect(setAuthToken).toBeDefined();
        expect(typeof setAuthToken).toBe("function");
    });

    test("setAuthToken should accept string token", () => {
        expect(() => setAuthToken("test-token")).not.toThrow();
    });

    test("setAuthToken should accept null to clear token", () => {
        setAuthToken("test-token");
        expect(() => setAuthToken(null)).not.toThrow();
    });

    test("setAuthToken should accept multiple calls", () => {
        setAuthToken("token1");
        setAuthToken("token2");
        setAuthToken(null);
        setAuthToken("token3");

        // Should not throw
        expect(true).toBe(true);
    });

    test("client should have query method", () => {
        expect(client.query).toBeDefined();
        expect(typeof client.query).toBe("function");
    });

    test("client should have mutate method", () => {
        expect(client.mutate).toBeDefined();
        expect(typeof client.mutate).toBe("function");
    });

    test("client should have subscribe method", () => {
        expect(client.subscribe).toBeDefined();
        expect(typeof client.subscribe).toBe("function");
    });

    test("client should have readQuery method", () => {
        expect(client.readQuery).toBeDefined();
        expect(typeof client.readQuery).toBe("function");
    });

    test("client should have writeQuery method", () => {
        expect(client.writeQuery).toBeDefined();
        expect(typeof client.writeQuery).toBe("function");
    });
});
