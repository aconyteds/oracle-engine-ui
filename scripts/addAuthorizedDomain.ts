import admin from "firebase-admin";

const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT as string
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

async function addAuthorizedDomain(domain: string) {
    const auth = admin.auth();

    try {
        const settings = await auth.getSettings();
        const existingDomains = settings.authorizedDomains || [];

        if (!existingDomains.includes(domain)) {
            await auth.updateSettings({
                authorizedDomains: [...existingDomains, domain],
            });
            console.log(`✅ Added domain: ${domain}`);
        } else {
            console.log(`ℹ️ Domain already exists: ${domain}`);
        }
    } catch (error) {
        console.error("❌ Error updating authorized domains:", error);
        process.exit(1);
    }
}

const prNumber = process.env.GITHUB_PR_NUMBER;
const previewDomain = `oracle-engine-7dfa6--pr-${prNumber}--wzsrkdlx.web.app`;

addAuthorizedDomain(previewDomain);
