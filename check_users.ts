
import { prisma } from "@/lib/prisma";

async function checkUsers() {
    const users = await prisma.user.findMany({
        include: { accounts: true }
    });
    console.log("Found Users:", users.length);
    users.forEach(u => {
        console.log(`- ${u.email} (ID: ${u.id})`);
        console.log(`  Providers: ${u.accounts.map(a => a.provider).join(", ") || "None (Credentials?)"}`);
        console.log(`  Password Hash Present: ${!!u.password}`);
    });
}

checkUsers();
