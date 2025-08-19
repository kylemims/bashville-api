// gen.js — turn your /projects JSON into launch.sh
// Usage: curl .../projects | node gen.js > launch.sh && chmod +x launch.sh

function generateBashScript(project) {
  const commands = project.commands_preview || [];
  const palette = project.color_palette_preview;

  let script = `#!/bin/bash
# ${project.title} - Auto-generated setup script
# Generated on ${new Date().toISOString().split("T")[0]}

`;

  if (project.description) {
    script += `# Description: ${project.description}\n\n`;
  }

  if (palette) {
    script += `# Color Variables from "${palette.name}" palette
export PRIMARY_COLOR="${palette.primary_hex}"
export SECONDARY_COLOR="${palette.secondary_hex}"
export ACCENT_COLOR="${palette.accent_hex}"
export BACKGROUND_COLOR="${palette.background_hex}"

`;
  }

  if (commands.length > 0) {
    script += `# Project Commands
echo "🚀 Setting up ${project.title}..."

`;
    commands.forEach((cmd, index) => {
      script += `# ${cmd.label}
echo "Step ${index + 1}: ${cmd.label}"
${cmd.command_text}

`;
    });
    script += `echo "✅ ${project.title} setup complete!"
`;
  } else {
    script += `echo "🚀 ${project.title} - No commands configured yet"
`;
  }

  return script;
}

// Read JSON (either an array of projects or a single project) from stdin
const chunks = [];
process.stdin.on("data", (d) => chunks.push(d));
process.stdin.on("end", () => {
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    console.error("No JSON received on stdin.");
    process.exit(1);
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error("Invalid JSON:", e.message);
    process.exit(1);
  }
  const project = Array.isArray(data) ? data[0] : data;
  if (!project) {
    console.error("No project found in JSON.");
    process.exit(1);
  }
  process.stdout.write(generateBashScript(project));
});
