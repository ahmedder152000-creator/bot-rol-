const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const express = require('express');
const fs = require('fs');

// ============================================
// ENVIRONMENT VARIABLES
// ============================================
const {
    BOT_TOKEN,
    GUILD_ID,
    ROLES_PANEL_CHANNEL_ID,
    LOG_CHANNEL_ID
} = process.env;

// ============================================
// CLIENT INITIALIZATION
// ============================================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// ============================================
// ROLES CONFIGURATION - غادي تبدل هنا الرولات ديالك
// ============================================
const GAME_ROLES = [
    { 
        id: "1508204668449329272",  // حط هنا الرول ديال FreeFire
        name: "FreeFire", 
        emoji: "🔥", 
        description: "FreeFire player",
        color: "#FF4655"
    },
    { 
        id: "1508204622924353556",  // حط هنا الرول ديال Minecraft
        name: "Minecraft", 
        emoji: "⛏️", 
        description: "Minecraft player",
        color: "#44AA44"
    },
    { 
        id: "1508204961937494016",  // حط هنا الرول ديال Roblox
        name: "Roblox", 
        emoji: "🎮", 
        description: "Roblox player",
        color: "#EE4444"
    },
    { 
        id: "1508204882795036702",  // حط هنا الرول ديال Valorant
        name: "Valorant", 
        emoji: "🎯", 
        description: "Valorant player",
        color: "#FD4556"
    },
    { 
        id: "1508205150915788901",  // حط هنا الرول ديال League of Legends
        name: "League of Legends", 
        emoji: "🏆", 
        description: "LoL player",
        color: "#0AC8B9"
    },
    { 
        id: "1508205045718454422",  // حط هنا الرول ديال Fortnite
        name: "Fortnite", 
        emoji: "🔫", 
        description: "Fortnite player",
        color: "#7B42BC"
    }
];

// إضافة رولات إضافية تقدر تزيد
const OTHER_ROLES = [
    // {
    //     id: "ROLE_ID",
    //     name: "Role Name",
    //     emoji: "🎭",
    //     description: "Role description"
    // }
];

// ============================================
// BUTTON ROLES (Buttons with GIF support)
// ============================================
const BUTTON_ROLES = [
    {
        id: "button_updates",
        label: "📢 Updates",
        emoji: "🔔",
        style: ButtonStyle.Primary,
        roleId: "UPDATES_ROLE_ID",
        description: "Get update notifications"
    },
    {
        id: "button_giveaway",
        label: "🎁 Giveaways",
        emoji: "🎉",
        style: ButtonStyle.Success,
        roleId: "GIVEAWAY_ROLE_ID",
        description: "Get giveaway notifications"
    }
];

// ============================================
// HELPERS
// ============================================
async function sendLog(guild, message) {
    if (!LOG_CHANNEL_ID) return;
    const channel = guild.channels.cache.get(LOG_CHANNEL_ID);
    if (channel) {
        const embed = new EmbedBuilder()
            .setDescription(message)
            .setColor(0x2b2d31)
            .setTimestamp();
        await channel.send({ embeds: [embed] }).catch(() => {});
    }
}

// ============================================
// CREATE ROLES PANEL WITH GIF
// ============================================
async function createRolesPanel(channel) {
    // GIF URL - تقدر تبدلها بأي صورة متحركة
    const GIF_URL = "https://media.tenor.com/4TcHv3ZRwXgAAAAC/gaming.gif"; // حط هنا رابط الصورة المتحركة ديالك
    
    const embed = new EmbedBuilder()
        .setTitle("🎮 **GAME ROLES** 🎮")
        .setDescription(
            `> **Choose your games and get the corresponding roles!**\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `**📌 HOW IT WORKS**\n` +
            `• Click on the buttons below to get roles\n` +
            `• Click again to remove the role\n` +
            `• You can select multiple games\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `**🎮 AVAILABLE GAME ROLES**\n`
        )
        .setColor(0x5865F2)
        .setImage(GIF_URL)  // هنا الصورة المتحركة
        .setFooter({ text: "Bonbon Utilities • 2026", iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    // إضافة الألعاب للـ embed
    let gameList = "";
    for (const game of GAME_ROLES) {
        gameList += `> ${game.emoji} **${game.name}** — ${game.description}\n`;
    }
    embed.addFields({ name: "━━━━━━━━━━━━━━━━━━", value: gameList, inline: false });

    // أزرار الألعاب (في 3 صفوف)
    const rows = [];
    const buttonsPerRow = 2; // عدد الأزرار في كل صف
    for (let i = 0; i < GAME_ROLES.length; i += buttonsPerRow) {
        const row = new ActionRowBuilder();
        const gamesInRow = GAME_ROLES.slice(i, i + buttonsPerRow);
        for (const game of gamesInRow) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`role_${game.id}`)
                    .setLabel(game.name)
                    .setEmoji(game.emoji)
                    .setStyle(ButtonStyle.Secondary)
            );
        }
        rows.push(row);
    }

    // إضافة صف الأزرار الإضافية إذا وجدت
    if (BUTTON_ROLES.length > 0) {
        const extraRow = new ActionRowBuilder();
        for (const btn of BUTTON_ROLES) {
            extraRow.addComponents(
                new ButtonBuilder()
                    .setCustomId(`role_${btn.id}`)
                    .setLabel(btn.label)
                    .setEmoji(btn.emoji)
                    .setStyle(btn.style)
            );
        }
        rows.push(extraRow);
    }

    await channel.send({ embeds: [embed], components: rows });
}

// ============================================
// CREATE SELECT MENU ROLES PANEL (Dropdown version)
// ============================================
async function createSelectRolesPanel(channel) {
    const GIF_URL = "https://images-ext-1.discordapp.net/external/_LdcZiTLV-b3ppxLLcVRVN0qyjA1_ni8NDiAZpOTYHA/https/i.imgur.com/IAzRQrM.gif";
    
    const embed = new EmbedBuilder()
        .setTitle("🎮 **GAME ROLES** 🎮")
        .setDescription(
            `> **Select your games from the dropdown menu!**\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `**📌 HOW IT WORKS**\n` +
            `• Select games from the dropdown below\n` +
            `• You will get the roles automatically\n` +
            `• Select again to remove roles\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `**🎮 AVAILABLE GAME ROLES**\n`
        )
        .setColor(0x5865F2)
        .setImage(GIF_URL)
        .setFooter({ text: "Bonbon Utilities • 2026", iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    let gameList = "";
    for (const game of GAME_ROLES) {
        gameList += `> ${game.emoji} **${game.name}** — ${game.description}\n`;
    }
    embed.addFields({ name: "━━━━━━━━━━━━━━━━", value: gameList, inline: false });

    // Dropdown menu للألعاب
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('game_roles_select')
        .setPlaceholder('🎯 Select your games...')
        .setMinValues(0)
        .setMaxValues(GAME_ROLES.length);

    for (const game of GAME_ROLES) {
        selectMenu.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(game.name)
                .setValue(game.id)
                .setDescription(game.description)
                .setEmoji(game.emoji)
        );
    }

    const row = new ActionRowBuilder().addComponents(selectMenu);
    await channel.send({ embeds: [embed], components: [row] });
}

// ============================================
// TOGGLE ROLE FUNCTION
// ============================================
async function toggleRole(interaction, roleId, roleName) {
    const member = interaction.member;
    const role = interaction.guild.roles.cache.get(roleId);
    
    if (!role) {
        return interaction.reply({ 
            content: `❌ Role not found! Please contact an administrator.`, 
            ephemeral: true 
        });
    }

    if (member.roles.cache.has(roleId)) {
        await member.roles.remove(role);
        await interaction.reply({ 
            content: `✅ Removed role **${role.name}**`, 
            ephemeral: true 
        });
        await sendLog(interaction.guild, `🔴 **${member.user.tag}** removed role **${role.name}**`);
    } else {
        await member.roles.add(role);
        await interaction.reply({ 
            content: `✅ Added role **${role.name}**`, 
            ephemeral: true 
        });
        await sendLog(interaction.guild, `🟢 **${member.user.tag}** added role **${role.name}**`);
    }
}

// ============================================
// READY EVENT
// ============================================
client.once('ready', async () => {
    console.log(`✨ ${client.user.tag} is online!`);
    console.log(`🎮 Game Roles Bot - Ready to serve!`);
    
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) {
        console.error("❌ Guild not found! Check GUILD_ID environment variable.");
        return;
    }

    console.log(`\n📊 Loading game roles...`);
    for (const game of GAME_ROLES) {
        const role = guild.roles.cache.get(game.id);
        console.log(`  ✓ ${game.name}: ${role ? role.name : '⚠️ Role not found'} (${game.id})`);
    }

    // إنشاء البانيل في الشانل المحدد
    if (ROLES_PANEL_CHANNEL_ID) {
        const panelChannel = client.channels.cache.get(ROLES_PANEL_CHANNEL_ID);
        if (panelChannel) {
            // حذف الرسائل القديمة
            const messages = await panelChannel.messages.fetch({ limit: 10 });
            for (const msg of messages.values()) {
                if (msg.author.id === client.user.id) {
                    await msg.delete().catch(() => {});
                }
            }
            
            // اختار نوع البانيل اللي بغيتي:
            await createRolesPanel(panelChannel);        // للأزرار
            // await createSelectRolesPanel(panelChannel); // للDropdown
            
            console.log("\n✅ Roles panel deployed!");
        } else {
            console.error(`❌ Channel ${ROLES_PANEL_CHANNEL_ID} not found!`);
        }
    }

    console.log(`\n🚀 Bot is ready!`);
});

// ============================================
// BUTTON INTERACTIONS
// ============================================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    
    if (interaction.customId.startsWith('role_')) {
        const roleIdPart = interaction.customId.replace('role_', '');
        
        // البحث في GAME_ROLES
        let roleConfig = GAME_ROLES.find(r => r.id === roleIdPart);
        
        // البحث في BUTTON_ROLES
        if (!roleConfig) {
            const buttonRole = BUTTON_ROLES.find(r => r.id === roleIdPart);
            if (buttonRole) {
                await toggleRole(interaction, buttonRole.roleId, buttonRole.label);
            }
            return;
        }
        
        await toggleRole(interaction, roleConfig.id, roleConfig.name);
    }
});

// ============================================
// SELECT MENU INTERACTIONS
// ============================================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== 'game_roles_select') return;
    
    const selectedRoles = interaction.values;
    const member = interaction.member;
    
    const added = [];
    const removed = [];
    
    // إضافة الرولات الجديدة
    for (const roleId of selectedRoles) {
        const role = interaction.guild.roles.cache.get(roleId);
        const roleConfig = GAME_ROLES.find(r => r.id === roleId);
        if (role && !member.roles.cache.has(roleId)) {
            await member.roles.add(role);
            added.push(roleConfig?.name || role.name);
        }
    }
    
    // إزالة الرولات اللي ما تمش تختارش
    for (const roleConfig of GAME_ROLES) {
        const roleId = roleConfig.id;
        const role = interaction.guild.roles.cache.get(roleId);
        if (role && member.roles.cache.has(roleId) && !selectedRoles.includes(roleId)) {
            await member.roles.remove(role);
            removed.push(roleConfig.name);
        }
    }
    
    let response = "✅ **Roles updated!**\n\n";
    if (added.length > 0) response += `**Added:** ${added.join(', ')}\n`;
    if (removed.length > 0) response += `**Removed:** ${removed.join(', ')}`;
    if (added.length === 0 && removed.length === 0) response = "No changes made to your roles.";
    
    await interaction.reply({ content: response, ephemeral: true });
    
    // تسجيل في اللوق
    if (added.length > 0 || removed.length > 0) {
        await sendLog(interaction.guild, `🎮 **${member.user.tag}** updated game roles\n➕ Added: ${added.join(', ') || 'None'}\n➖ Removed: ${removed.join(', ') || 'None'}`);
    }
});

// ============================================
// COMMAND TO REFRESH PANEL (for admins)
// ============================================
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    
    if (message.content.toLowerCase() === '!refreshroles') {
        const member = message.member;
        const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);
        
        if (!isAdmin) {
            return message.reply("❌ You don't have permission to use this command.");
        }
        
        const panelChannel = client.channels.cache.get(ROLES_PANEL_CHANNEL_ID);
        if (panelChannel) {
            const messages = await panelChannel.messages.fetch({ limit: 10 });
            for (const msg of messages.values()) {
                if (msg.author.id === client.user.id) {
                    await msg.delete().catch(() => {});
                }
            }
            await createRolesPanel(panelChannel);
            await message.reply("✅ Roles panel refreshed!");
        } else {
            await message.reply("❌ Panel channel not found!");
        }
    }
});

// ============================================
// ERROR HANDLING
// ============================================
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error);
});

// ============================================
// EXPRESS SERVER (لـ Railway)
// ============================================
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🎮 Game Roles Bot is running!');
});

app.listen(port, () => {
    console.log(`🌐 Web server running on port ${port}`);
});

// ============================================
// LOGIN
// ============================================
client.login(BOT_TOKEN);
