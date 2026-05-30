const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const express = require('express');

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
// ROLES CONFIGURATION - بإيموجيات صحيحة
// ============================================
const GAME_ROLES = [
    { 
        id: "1508204668449329272",  // Free fire
        name: "Free Fire", 
        emoji: "🔥", 
        label: "Free Fire"
    },
    { 
        id: "1508204622924353556",  // Minecraft
        name: "Minecraft", 
        emoji: "⛏️", 
        label: "Minecraft"
    },
    { 
        id: "1508204961937494016",  // Roblox
        name: "Roblox", 
        emoji: "🎮", 
        label: "Roblox"
    },
    { 
        id: "1508204882795036702",  // Valorant
        name: "Valorant", 
        emoji: "🎯", 
        label: "Valorant"
    },
    { 
        id: "1508205150915788901",  // League of Legends
        name: "League of Legends", 
        emoji: "🏆", 
        label: "League"
    },
    { 
        id: "1508205045718454422",  // CS:GO
        name: "CS:GO", 
        emoji: "🎮", 
        label: "CS:GO"
    },
    { 
        id: "1508205098692513983",  // Stumble Guys
        name: "Stumble Guys", 
        emoji: "🎲", 
        label: "Stumble"
    },
    { 
        id: "1508204989674160178",  // Among Us
        name: "Among Us", 
        emoji: "👽", 
        label: "Among Us"
    },
    { 
        id: "1508204921835749558",  // GTA
        name: "GTA", 
        emoji: "🚗", 
        label: "GTA"
    },
    { 
        id: "1508204796346368011",  // PES
        name: "PES", 
        emoji: "⚽", 
        label: "PES"
    },
    { 
        id: "1508204684299604028",  // Chess
        name: "Chess", 
        emoji: "♟️", 
        label: "Chess"
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
// CREATE ROLES PANEL
// ============================================
async function createRolesPanel(channel) {
    const GIF_URL = "https://images-ext-1.discordapp.net/external/_LdcZiTLV-b3ppxLLcVRVN0yjA1_ni8NDiAZpOTYHA/https/i.imgur.com/IAzRQrM.gif";
    
    const gameList = GAME_ROLES.map(game => `> @- ${game.name}`).join('\n');
    
    const embed = new EmbedBuilder()
        .setTitle("🎮 **GAME ROLES** ✨")
        .setDescription(
            `> **Do You Play Any Games?**\n\n` +
            gameList
        )
        .setColor(0x2b2d31)
        .setImage(GIF_URL)
        .setFooter({ text: "© 2026 BONBON. All rights reserved.", iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    // الأزرار (كل صف 3 أزرار)
    const rows = [];
    
    for (let i = 0; i < GAME_ROLES.length; i += 3) {
        const row = new ActionRowBuilder();
        const gamesInRow = GAME_ROLES.slice(i, i + 3);
        
        for (const game of gamesInRow) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`role_${game.id}`)
                    .setLabel(game.label)
                    .setEmoji(game.emoji)
                    .setStyle(ButtonStyle.Secondary)
            );
        }
        rows.push(row);
    }

    await channel.send({ embeds: [embed], components: rows });
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

    console.log(`\n📊 Loading game roles (${GAME_ROLES.length} roles):`);
    for (const game of GAME_ROLES) {
        const role = guild.roles.cache.get(game.id);
        console.log(`  ${game.emoji} ${game.name}: ${role ? '✅' : '❌'} (${game.id})`);
    }

    if (ROLES_PANEL_CHANNEL_ID) {
        const panelChannel = client.channels.cache.get(ROLES_PANEL_CHANNEL_ID);
        if (panelChannel) {
            const messages = await panelChannel.messages.fetch({ limit: 10 });
            for (const msg of messages.values()) {
                if (msg.author.id === client.user.id) {
                    await msg.delete().catch(() => {});
                }
            }
            
            await createRolesPanel(panelChannel);
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
        const roleId = interaction.customId.replace('role_', '');
        const roleConfig = GAME_ROLES.find(r => r.id === roleId);
        
        if (roleConfig) {
            await toggleRole(interaction, roleConfig.id, roleConfig.name);
        }
    }
});

// ============================================
// COMMAND TO REFRESH PANEL
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
// EXPRESS SERVER
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
