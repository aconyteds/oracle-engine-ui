import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useCampaignLimit } from "./useCampaignLimit";

vi.mock("@graphql", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@graphql")>();
    return {
        ...actual,
        useGetUsageLimitsQuery: vi.fn(),
    };
});

// Helper to create mock return values with proper typing
const mockQueryResult = (data: unknown) =>
    ({
        data,
        loading: !data,
        error: undefined,
    }) as ReturnType<typeof import("@graphql").useGetUsageLimitsQuery>;

describe("useCampaignLimit", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("when data is loading or unavailable", () => {
        test("should return defaults when usageData is undefined", async () => {
            const { useGetUsageLimitsQuery } = await import("@graphql");
            vi.mocked(useGetUsageLimitsQuery).mockReturnValue(
                mockQueryResult(undefined)
            );

            const { result } = renderHook(() => useCampaignLimit());

            expect(result.current.canCreate).toBe(false);
            expect(result.current.campaignLimit).toBe(0);
        });

        test("should return defaults when currentUser is null", async () => {
            const { useGetUsageLimitsQuery } = await import("@graphql");
            vi.mocked(useGetUsageLimitsQuery).mockReturnValue(
                mockQueryResult({ currentUser: null })
            );

            const { result } = renderHook(() => useCampaignLimit());

            expect(result.current.canCreate).toBe(false);
            expect(result.current.campaignLimit).toBe(0);
        });

        test("should return defaults when usageLimits is null", async () => {
            const { useGetUsageLimitsQuery } = await import("@graphql");
            vi.mocked(useGetUsageLimitsQuery).mockReturnValue(
                mockQueryResult({ currentUser: { usageLimits: null } })
            );

            const { result } = renderHook(() => useCampaignLimit());

            expect(result.current.canCreate).toBe(false);
            expect(result.current.campaignLimit).toBe(0);
        });

        test("should return defaults when campaignUsage is null", async () => {
            const { useGetUsageLimitsQuery } = await import("@graphql");
            vi.mocked(useGetUsageLimitsQuery).mockReturnValue(
                mockQueryResult({
                    currentUser: {
                        usageLimits: { campaignUsage: null },
                    },
                })
            );

            const { result } = renderHook(() => useCampaignLimit());

            expect(result.current.canCreate).toBe(false);
            expect(result.current.campaignLimit).toBe(0);
        });
    });

    describe("when data is available", () => {
        test("should return canCreate true when user can create campaigns", async () => {
            const { useGetUsageLimitsQuery } = await import("@graphql");
            vi.mocked(useGetUsageLimitsQuery).mockReturnValue(
                mockQueryResult({
                    currentUser: {
                        usageLimits: {
                            campaignUsage: {
                                canCreate: true,
                                limit: 5,
                                current: 2,
                            },
                        },
                    },
                })
            );

            const { result } = renderHook(() => useCampaignLimit());

            expect(result.current.canCreate).toBe(true);
            expect(result.current.campaignLimit).toBe(5);
        });

        test("should return canCreate false when user cannot create campaigns", async () => {
            const { useGetUsageLimitsQuery } = await import("@graphql");
            vi.mocked(useGetUsageLimitsQuery).mockReturnValue(
                mockQueryResult({
                    currentUser: {
                        usageLimits: {
                            campaignUsage: {
                                canCreate: false,
                                limit: 3,
                                current: 3,
                            },
                        },
                    },
                })
            );

            const { result } = renderHook(() => useCampaignLimit());

            expect(result.current.canCreate).toBe(false);
            expect(result.current.campaignLimit).toBe(3);
        });

        test("should default canCreate to false when null", async () => {
            const { useGetUsageLimitsQuery } = await import("@graphql");
            vi.mocked(useGetUsageLimitsQuery).mockReturnValue(
                mockQueryResult({
                    currentUser: {
                        usageLimits: {
                            campaignUsage: {
                                canCreate: null,
                                limit: 2,
                                current: 2,
                            },
                        },
                    },
                })
            );

            const { result } = renderHook(() => useCampaignLimit());

            expect(result.current.canCreate).toBe(false);
        });

        test("should default campaignLimit to 0 when null", async () => {
            const { useGetUsageLimitsQuery } = await import("@graphql");
            vi.mocked(useGetUsageLimitsQuery).mockReturnValue(
                mockQueryResult({
                    currentUser: {
                        usageLimits: {
                            campaignUsage: {
                                canCreate: true,
                                limit: null,
                                current: 0,
                            },
                        },
                    },
                })
            );

            const { result } = renderHook(() => useCampaignLimit());

            expect(result.current.campaignLimit).toBe(0);
        });
    });

    describe("limitMessage", () => {
        test("should use singular 'campaign' when limit is 1", async () => {
            const { useGetUsageLimitsQuery } = await import("@graphql");
            vi.mocked(useGetUsageLimitsQuery).mockReturnValue(
                mockQueryResult({
                    currentUser: {
                        usageLimits: {
                            campaignUsage: {
                                canCreate: false,
                                limit: 1,
                                current: 1,
                            },
                        },
                    },
                })
            );

            const { result } = renderHook(() => useCampaignLimit());

            expect(result.current.limitMessage).toBe(
                "You've reached your limit of 1 campaign. To create more, upgrade your subscription or delete an existing campaign."
            );
        });

        test("should use plural 'campaigns' when limit is greater than 1", async () => {
            const { useGetUsageLimitsQuery } = await import("@graphql");
            vi.mocked(useGetUsageLimitsQuery).mockReturnValue(
                mockQueryResult({
                    currentUser: {
                        usageLimits: {
                            campaignUsage: {
                                canCreate: false,
                                limit: 5,
                                current: 5,
                            },
                        },
                    },
                })
            );

            const { result } = renderHook(() => useCampaignLimit());

            expect(result.current.limitMessage).toBe(
                "You've reached your limit of 5 campaigns. To create more, upgrade your subscription or delete an existing campaign."
            );
        });

        test("should use plural 'campaigns' when limit is 0", async () => {
            const { useGetUsageLimitsQuery } = await import("@graphql");
            vi.mocked(useGetUsageLimitsQuery).mockReturnValue(
                mockQueryResult(undefined)
            );

            const { result } = renderHook(() => useCampaignLimit());

            expect(result.current.limitMessage).toBe(
                "You've reached your limit of 0 campaigns. To create more, upgrade your subscription or delete an existing campaign."
            );
        });
    });

    describe("query configuration", () => {
        test("should call useGetUsageLimitsQuery with network-only fetch policy", async () => {
            const { useGetUsageLimitsQuery } = await import("@graphql");
            vi.mocked(useGetUsageLimitsQuery).mockReturnValue(
                mockQueryResult(undefined)
            );

            renderHook(() => useCampaignLimit());

            expect(useGetUsageLimitsQuery).toHaveBeenCalledWith({
                fetchPolicy: "network-only",
            });
        });
    });
});
