import "@testing-library/jest-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "../../test-utils";
import {
    CAMPAIGN_TEMPLATES,
    CampaignForm,
    RULESET_OPTIONS,
} from "./CampaignForm";

// Mock GraphQL hooks
vi.mock("@graphql", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@graphql")>();
    return {
        ...actual,
        useCreateCampaignMutation: vi.fn(),
        useUpdateCampaignMutation: vi.fn(),
        useDeleteCampaignMutation: vi.fn(),
        useValidateCampaignNameQuery: vi.fn(),
    };
});

// Mock useCampaignLimit hook
vi.mock("@hooks", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@hooks")>();
    return {
        ...actual,
        useCampaignLimit: vi.fn(),
    };
});

// Mock Toaster context
vi.mock("../../contexts/Toaster.context", () => ({
    useToaster: vi.fn(),
    ToasterProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Helper to get mocked functions
const getMockGraphQL = async () => {
    const module = await import("@graphql");
    return {
        useCreateCampaignMutation: vi.mocked(module.useCreateCampaignMutation),
        useUpdateCampaignMutation: vi.mocked(module.useUpdateCampaignMutation),
        useDeleteCampaignMutation: vi.mocked(module.useDeleteCampaignMutation),
        useValidateCampaignNameQuery: vi.mocked(
            module.useValidateCampaignNameQuery
        ),
    };
};

const getMockHooks = async () => {
    const module = await import("@hooks");
    return {
        useCampaignLimit: vi.mocked(module.useCampaignLimit),
    };
};

const getMockToaster = async () => {
    const module = await import("../../contexts/Toaster.context");
    return {
        useToaster: vi.mocked(module.useToaster),
    };
};

// Mock campaign for edit mode
const mockCampaign = {
    id: "campaign-123",
    name: "Test Campaign",
    setting: "Fantasy World",
    tone: "Heroic",
    ruleset: "D&D 5e",
};

// Default mock return values
const createMutationMock = (loading = false) =>
    [
        vi.fn().mockResolvedValue({ data: null }),
        { loading, called: false, client: {}, reset: vi.fn() },
    ] as unknown;

const createValidationMock = (exists = false, loading = false) => ({
    data: { checkCampaignNameExists: { exists } },
    loading,
});

describe("CampaignForm Component", () => {
    const mockOnSuccess = vi.fn();
    const mockToast = {
        success: vi.fn(),
        danger: vi.fn(),
        warning: vi.fn(),
        info: vi.fn(),
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        // Setup default mocks
        const graphql = await getMockGraphQL();
        graphql.useCreateCampaignMutation.mockReturnValue(
            createMutationMock() as ReturnType<
                typeof graphql.useCreateCampaignMutation
            >
        );
        graphql.useUpdateCampaignMutation.mockReturnValue(
            createMutationMock() as ReturnType<
                typeof graphql.useUpdateCampaignMutation
            >
        );
        graphql.useDeleteCampaignMutation.mockReturnValue(
            createMutationMock() as ReturnType<
                typeof graphql.useDeleteCampaignMutation
            >
        );
        graphql.useValidateCampaignNameQuery.mockReturnValue(
            createValidationMock() as ReturnType<
                typeof graphql.useValidateCampaignNameQuery
            >
        );

        const hooks = await getMockHooks();
        hooks.useCampaignLimit.mockReturnValue({
            canCreate: true,
            campaignLimit: 5,
            limitMessage: "You can create up to 5 campaigns.",
        });

        const toaster = await getMockToaster();
        toaster.useToaster.mockReturnValue({ toast: mockToast });
    });

    afterEach(() => {
        cleanup();
    });

    describe("Form Rendering", () => {
        test("should render all form fields", () => {
            render(<CampaignForm onSuccess={mockOnSuccess} />);

            expect(
                screen.getByPlaceholderText("Enter campaign name")
            ).toBeInTheDocument();
            expect(
                screen.getByPlaceholderText("e.g., Real Earth, Fictional World")
            ).toBeInTheDocument();
            expect(
                screen.getByPlaceholderText("e.g., Comedic, Dark, Heroic")
            ).toBeInTheDocument();
            expect(screen.getByText("Select a ruleset")).toBeInTheDocument();
        });

        test("should render form labels", () => {
            render(<CampaignForm onSuccess={mockOnSuccess} />);

            expect(screen.getByText("Campaign Name *")).toBeInTheDocument();
            expect(screen.getByText("Setting")).toBeInTheDocument();
            expect(screen.getByText("Tone")).toBeInTheDocument();
            expect(screen.getByText("Ruleset")).toBeInTheDocument();
        });

        test("should render helper text in create mode", () => {
            render(<CampaignForm onSuccess={mockOnSuccess} />);

            expect(
                screen.getByText(/The Oracle uses this information/i)
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    /What you call your game — "Tuesday Night Crew"/i
                )
            ).toBeInTheDocument();
        });

        test("should not render helper text in edit mode", () => {
            render(
                <CampaignForm
                    campaign={mockCampaign}
                    onSuccess={mockOnSuccess}
                />
            );

            expect(
                screen.queryByText(/The Oracle uses this information/i)
            ).not.toBeInTheDocument();
        });

        test("should render all ruleset options", () => {
            render(<CampaignForm onSuccess={mockOnSuccess} />);

            const select = screen.getByRole("combobox");
            const options = Array.from(select.querySelectorAll("option"));

            // Check that all ruleset options are present (plus the default "Select a ruleset")
            expect(options.length).toBe(RULESET_OPTIONS.length + 1);

            for (const ruleset of RULESET_OPTIONS) {
                expect(
                    screen.getByRole("option", { name: ruleset })
                ).toBeInTheDocument();
            }
        });
    });

    describe("Quick Start Templates", () => {
        test("should render template buttons in create mode", () => {
            render(<CampaignForm onSuccess={mockOnSuccess} />);

            expect(
                screen.getByText("Quick Start Templates")
            ).toBeInTheDocument();
            expect(screen.getByText("Classic Fantasy")).toBeInTheDocument();
            expect(screen.getByText("Gritty Horror")).toBeInTheDocument();
            expect(
                screen.getByText("Beer & Pretzels Comedy")
            ).toBeInTheDocument();
            expect(
                screen.getByText("Murder Hobos on Parade")
            ).toBeInTheDocument();
        });

        test("should not render template buttons in edit mode", () => {
            render(
                <CampaignForm
                    campaign={mockCampaign}
                    onSuccess={mockOnSuccess}
                />
            );

            expect(
                screen.queryByText("Quick Start Templates")
            ).not.toBeInTheDocument();
        });

        test.each([
            ["Classic Fantasy", "classicFantasy"],
            ["Gritty Horror", "grittyHorror"],
            ["Beer & Pretzels Comedy", "beerPretzels"],
            ["Murder Hobos on Parade", "murderHobos"],
        ] as const)(
            "should populate setting and tone when %s template is clicked",
            (templateName, templateKey) => {
                render(<CampaignForm onSuccess={mockOnSuccess} />);

                fireEvent.click(screen.getByText(templateName));

                const template =
                    CAMPAIGN_TEMPLATES[
                        templateKey as keyof typeof CAMPAIGN_TEMPLATES
                    ];
                const settingInput = screen.getByPlaceholderText(
                    "e.g., Real Earth, Fictional World"
                ) as HTMLTextAreaElement;
                const toneInput = screen.getByPlaceholderText(
                    "e.g., Comedic, Dark, Heroic"
                ) as HTMLTextAreaElement;

                expect(settingInput.value).toBe(template.setting);
                expect(toneInput.value).toBe(template.tone);
            }
        );
    });

    describe("Form Data Display", () => {
        test("should display campaign data in edit mode", () => {
            render(
                <CampaignForm
                    campaign={mockCampaign}
                    onSuccess={mockOnSuccess}
                />
            );

            expect(
                screen.getByDisplayValue("Test Campaign")
            ).toBeInTheDocument();
            expect(
                screen.getByDisplayValue("Fantasy World")
            ).toBeInTheDocument();
            expect(screen.getByDisplayValue("Heroic")).toBeInTheDocument();
            expect(screen.getByDisplayValue("D&D 5e")).toBeInTheDocument();
        });

        test("should start with empty fields in create mode", () => {
            render(<CampaignForm onSuccess={mockOnSuccess} />);

            const nameInput = screen.getByPlaceholderText(
                "Enter campaign name"
            ) as HTMLInputElement;
            const settingInput = screen.getByPlaceholderText(
                "e.g., Real Earth, Fictional World"
            ) as HTMLTextAreaElement;
            const toneInput = screen.getByPlaceholderText(
                "e.g., Comedic, Dark, Heroic"
            ) as HTMLTextAreaElement;

            expect(nameInput.value).toBe("");
            expect(settingInput.value).toBe("");
            expect(toneInput.value).toBe("");
        });
    });

    describe("Field onChange Handlers", () => {
        test.each([
            ["name", "Enter campaign name", "New Campaign"],
            ["setting", "e.g., Real Earth, Fictional World", "Dark Fantasy"],
            ["tone", "e.g., Comedic, Dark, Heroic", "Gritty"],
        ])(
            "should update %s field when changed",
            (_fieldName, placeholder, testValue) => {
                render(<CampaignForm onSuccess={mockOnSuccess} />);

                const input = screen.getByPlaceholderText(placeholder);
                fireEvent.change(input, { target: { value: testValue } });

                expect(input).toHaveValue(testValue);
            }
        );

        test("should update ruleset when changed", () => {
            render(<CampaignForm onSuccess={mockOnSuccess} />);

            const select = screen.getByRole("combobox");
            fireEvent.change(select, { target: { value: "Pathfinder 2e" } });

            expect(select).toHaveValue("Pathfinder 2e");
        });
    });

    describe("Submit Button States", () => {
        test("should show 'Create Campaign' button text in create mode", () => {
            render(<CampaignForm onSuccess={mockOnSuccess} />);

            expect(screen.getByText("Create Campaign")).toBeInTheDocument();
        });

        test("should show 'Save Changes' button text in edit mode", () => {
            render(
                <CampaignForm
                    campaign={mockCampaign}
                    onSuccess={mockOnSuccess}
                />
            );

            expect(screen.getByText("Save Changes")).toBeInTheDocument();
        });

        test("should use custom submitButtonText when provided", () => {
            render(
                <CampaignForm
                    onSuccess={mockOnSuccess}
                    submitButtonText="Start Adventure"
                />
            );

            expect(screen.getByText("Start Adventure")).toBeInTheDocument();
        });

        test("should disable submit button when name is empty", () => {
            render(<CampaignForm onSuccess={mockOnSuccess} />);

            const submitButton = screen.getByRole("button", {
                name: "Create Campaign",
            });
            expect(submitButton).toBeDisabled();
        });

        test("should enable submit button when name is provided", () => {
            render(<CampaignForm onSuccess={mockOnSuccess} />);

            const nameInput = screen.getByPlaceholderText(
                "Enter campaign name"
            );
            fireEvent.change(nameInput, { target: { value: "My Campaign" } });

            const submitButton = screen.getByRole("button", {
                name: "Create Campaign",
            });
            expect(submitButton).not.toBeDisabled();
        });

        test("should disable submit button when name already exists", async () => {
            const graphql = await getMockGraphQL();
            graphql.useValidateCampaignNameQuery.mockReturnValue(
                createValidationMock(true) as ReturnType<
                    typeof graphql.useValidateCampaignNameQuery
                >
            );

            render(<CampaignForm onSuccess={mockOnSuccess} />);

            const nameInput = screen.getByPlaceholderText(
                "Enter campaign name"
            );
            fireEvent.change(nameInput, {
                target: { value: "Existing Campaign" },
            });

            const submitButton = screen.getByRole("button", {
                name: "Create Campaign",
            });
            expect(submitButton).toBeDisabled();
        });

        test("should show validation error when name exists", async () => {
            const graphql = await getMockGraphQL();
            graphql.useValidateCampaignNameQuery.mockReturnValue(
                createValidationMock(true) as ReturnType<
                    typeof graphql.useValidateCampaignNameQuery
                >
            );

            render(<CampaignForm onSuccess={mockOnSuccess} />);

            const nameInput = screen.getByPlaceholderText(
                "Enter campaign name"
            );
            fireEvent.change(nameInput, {
                target: { value: "Existing Campaign" },
            });

            expect(
                screen.getByText(/A campaign with this name already exists/i)
            ).toBeInTheDocument();
        });

        test("should show 'Checking availability...' when validating", async () => {
            const graphql = await getMockGraphQL();
            graphql.useValidateCampaignNameQuery.mockReturnValue(
                createValidationMock(false, true) as ReturnType<
                    typeof graphql.useValidateCampaignNameQuery
                >
            );

            render(<CampaignForm onSuccess={mockOnSuccess} />);

            expect(
                screen.getByText("Checking availability...")
            ).toBeInTheDocument();
        });
    });

    describe("Campaign Limit", () => {
        test("should show disabled button with overlay when canCreate is false", async () => {
            const hooks = await getMockHooks();
            hooks.useCampaignLimit.mockReturnValue({
                canCreate: false,
                campaignLimit: 3,
                limitMessage:
                    "You've reached your limit of 3 campaigns. Upgrade to create more.",
            });

            render(<CampaignForm onSuccess={mockOnSuccess} />);

            const submitButton = screen.getByRole("button", {
                name: "Create Campaign",
            });
            expect(submitButton).toBeDisabled();
        });

        test("should allow submit in edit mode even when canCreate is false", async () => {
            const hooks = await getMockHooks();
            hooks.useCampaignLimit.mockReturnValue({
                canCreate: false,
                campaignLimit: 3,
                limitMessage:
                    "You've reached your limit of 3 campaigns. Upgrade to create more.",
            });

            render(
                <CampaignForm
                    campaign={mockCampaign}
                    onSuccess={mockOnSuccess}
                />
            );

            const submitButton = screen.getByRole("button", {
                name: "Save Changes",
            });
            // In edit mode, the button should not be affected by canCreate
            expect(submitButton).not.toBeDisabled();
        });
    });

    describe("Form Submission", () => {
        test("should call createCampaign mutation on submit in create mode", async () => {
            const graphql = await getMockGraphQL();
            const mockCreate = vi.fn().mockResolvedValue({
                data: {
                    createCampaign: {
                        campaign: {
                            id: "new-campaign",
                            name: "New Campaign",
                            setting: "",
                            tone: "",
                            ruleset: "",
                        },
                    },
                },
            });
            graphql.useCreateCampaignMutation.mockReturnValue([
                mockCreate,
                { loading: false, called: false, client: {}, reset: vi.fn() },
            ] as unknown as ReturnType<
                typeof graphql.useCreateCampaignMutation
            >);

            render(<CampaignForm onSuccess={mockOnSuccess} />);

            const nameInput = screen.getByPlaceholderText(
                "Enter campaign name"
            );
            fireEvent.change(nameInput, { target: { value: "New Campaign" } });

            const submitButton = screen.getByRole("button", {
                name: "Create Campaign",
            });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockCreate).toHaveBeenCalledWith({
                    variables: {
                        input: {
                            name: "New Campaign",
                            setting: "",
                            tone: "",
                            ruleset: "",
                        },
                    },
                });
            });
        });

        test("should call updateCampaign mutation on submit in edit mode", async () => {
            const graphql = await getMockGraphQL();
            const mockUpdate = vi.fn().mockResolvedValue({
                data: {
                    updateCampaign: {
                        campaign: {
                            ...mockCampaign,
                            name: "Updated Campaign",
                        },
                    },
                },
            });
            graphql.useUpdateCampaignMutation.mockReturnValue([
                mockUpdate,
                { loading: false, called: false, client: {}, reset: vi.fn() },
            ] as unknown as ReturnType<
                typeof graphql.useUpdateCampaignMutation
            >);

            render(
                <CampaignForm
                    campaign={mockCampaign}
                    onSuccess={mockOnSuccess}
                />
            );

            const nameInput = screen.getByDisplayValue("Test Campaign");
            fireEvent.change(nameInput, {
                target: { value: "Updated Campaign" },
            });

            const submitButton = screen.getByRole("button", {
                name: "Save Changes",
            });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockUpdate).toHaveBeenCalledWith({
                    variables: {
                        input: {
                            campaignId: "campaign-123",
                            name: "Updated Campaign",
                            setting: "Fantasy World",
                            tone: "Heroic",
                            ruleset: "D&D 5e",
                        },
                    },
                });
            });
        });

        test("should call onSuccess with campaign data after successful create", async () => {
            const graphql = await getMockGraphQL();
            const newCampaign = {
                id: "new-campaign",
                name: "New Campaign",
                setting: "",
                tone: "",
                ruleset: "",
            };
            graphql.useCreateCampaignMutation.mockReturnValue([
                vi.fn().mockResolvedValue({
                    data: { createCampaign: { campaign: newCampaign } },
                }),
                { loading: false, called: false, client: {}, reset: vi.fn() },
            ] as unknown as ReturnType<
                typeof graphql.useCreateCampaignMutation
            >);

            render(<CampaignForm onSuccess={mockOnSuccess} />);

            const nameInput = screen.getByPlaceholderText(
                "Enter campaign name"
            );
            fireEvent.change(nameInput, { target: { value: "New Campaign" } });

            const submitButton = screen.getByRole("button", {
                name: "Create Campaign",
            });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockOnSuccess).toHaveBeenCalledWith(newCampaign);
            });
        });

        test("should show success toast after successful create", async () => {
            const graphql = await getMockGraphQL();
            graphql.useCreateCampaignMutation.mockReturnValue([
                vi.fn().mockResolvedValue({
                    data: {
                        createCampaign: {
                            campaign: {
                                id: "new",
                                name: "New Campaign",
                            },
                        },
                    },
                }),
                { loading: false, called: false, client: {}, reset: vi.fn() },
            ] as unknown as ReturnType<
                typeof graphql.useCreateCampaignMutation
            >);

            render(<CampaignForm onSuccess={mockOnSuccess} />);

            const nameInput = screen.getByPlaceholderText(
                "Enter campaign name"
            );
            fireEvent.change(nameInput, { target: { value: "New Campaign" } });

            const submitButton = screen.getByRole("button", {
                name: "Create Campaign",
            });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockToast.success).toHaveBeenCalledWith({
                    title: "Campaign Created",
                    message: '"New Campaign" has been created successfully.',
                    duration: 0,
                });
            });
        });

        test("should show error toast on create failure", async () => {
            const graphql = await getMockGraphQL();
            graphql.useCreateCampaignMutation.mockReturnValue([
                vi.fn().mockRejectedValue(new Error("Network error")),
                { loading: false, called: false, client: {}, reset: vi.fn() },
            ] as unknown as ReturnType<
                typeof graphql.useCreateCampaignMutation
            >);

            render(<CampaignForm onSuccess={mockOnSuccess} />);

            const nameInput = screen.getByPlaceholderText(
                "Enter campaign name"
            );
            fireEvent.change(nameInput, { target: { value: "New Campaign" } });

            const submitButton = screen.getByRole("button", {
                name: "Create Campaign",
            });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockToast.danger).toHaveBeenCalledWith({
                    title: "Creation Failed",
                    message: "Failed to create campaign. Please try again.",
                    duration: 5000,
                });
            });
        });

        test("should show 'Saving...' text when loading", async () => {
            const graphql = await getMockGraphQL();
            graphql.useCreateCampaignMutation.mockReturnValue([
                vi.fn(),
                { loading: true, called: false, client: {}, reset: vi.fn() },
            ] as unknown as ReturnType<
                typeof graphql.useCreateCampaignMutation
            >);

            render(<CampaignForm onSuccess={mockOnSuccess} />);

            expect(screen.getByText("Saving...")).toBeInTheDocument();
        });
    });

    describe("Delete Functionality", () => {
        test("should not show delete button when showDelete is false", () => {
            render(
                <CampaignForm
                    campaign={mockCampaign}
                    onSuccess={mockOnSuccess}
                    showDelete={false}
                />
            );

            expect(screen.queryByText("Delete")).not.toBeInTheDocument();
        });

        test("should show delete button when showDelete is true in edit mode", () => {
            render(
                <CampaignForm
                    campaign={mockCampaign}
                    onSuccess={mockOnSuccess}
                    showDelete={true}
                />
            );

            expect(screen.getByText("Delete")).toBeInTheDocument();
        });

        test("should not show delete button in create mode even with showDelete true", () => {
            render(
                <CampaignForm onSuccess={mockOnSuccess} showDelete={true} />
            );

            expect(screen.queryByText("Delete")).not.toBeInTheDocument();
        });
    });

    describe("Loading States", () => {
        test("should disable all inputs when loading", async () => {
            const graphql = await getMockGraphQL();
            graphql.useCreateCampaignMutation.mockReturnValue([
                vi.fn(),
                { loading: true, called: false, client: {}, reset: vi.fn() },
            ] as unknown as ReturnType<
                typeof graphql.useCreateCampaignMutation
            >);

            render(<CampaignForm onSuccess={mockOnSuccess} />);

            expect(
                screen.getByPlaceholderText("Enter campaign name")
            ).toBeDisabled();
            expect(
                screen.getByPlaceholderText("e.g., Real Earth, Fictional World")
            ).toBeDisabled();
            expect(
                screen.getByPlaceholderText("e.g., Comedic, Dark, Heroic")
            ).toBeDisabled();
            expect(screen.getByRole("combobox")).toBeDisabled();
        });

        test("should disable template buttons when loading", async () => {
            const graphql = await getMockGraphQL();
            graphql.useCreateCampaignMutation.mockReturnValue([
                vi.fn(),
                { loading: true, called: false, client: {}, reset: vi.fn() },
            ] as unknown as ReturnType<
                typeof graphql.useCreateCampaignMutation
            >);

            render(<CampaignForm onSuccess={mockOnSuccess} />);

            expect(screen.getByText("Classic Fantasy")).toBeDisabled();
            expect(screen.getByText("Gritty Horror")).toBeDisabled();
        });
    });
});
