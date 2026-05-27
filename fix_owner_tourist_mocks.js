const fs = require('fs');

const ownerPath = 'C:\\Users\\karen\\.gemini\\antigravity\\scratch\\hungry-lakwatsero\\hungrylakwatsero\\src\\pages\\OwnerDashboard.jsx';
let ownerContent = fs.readFileSync(ownerPath, 'utf8');

// Replace fake success in catch blocks with toast.error
ownerContent = ownerContent.replace(/catch(?: \([^)]*\))? \{\s*[\s\S]*?toast\.success\([^)]*Offline[^)]*\);\s*[\s\S]*?\}/g, (match) => {
  return `catch (err) { toast.error(err.response?.data?.message || 'Action failed.'); }`;
});

// For Post Create/Edit: they have specific fallbacks.
ownerContent = ownerContent.replace(/} catch \{\s*onPost\(newPost\);\s*toast\.success\('Post published! \(Offline mode\)'\);\s*\}/g, "} catch (err) { toast.error(err.response?.data?.message || 'Failed to publish post.'); }");
ownerContent = ownerContent.replace(/} catch \{\s*onSave\(updatedPost\);\s*toast\.success\('Post updated! \(Offline\)'\);\s*onClose\(\);\s*\}/g, "} catch (err) { toast.error(err.response?.data?.message || 'Failed to update post.'); }");

// Replace manual offline handling in delete menu item:
ownerContent = ownerContent.replace(/setMenuItems\(prev => prev\.filter\(i => i\.id !== id\)\);\s*toast\.success\('Menu item removed\.'\);/g, `
      try {
        await axios.delete(\`/api/restaurants/\${restaurant.id}/menu/\${id}\`);
        setMenuItems(prev => prev.filter(i => i.id !== id));
        toast.success('Menu item removed.');
      } catch (err) { toast.error(err.response?.data?.message || 'Failed to remove menu item.'); }
`);

fs.writeFileSync(ownerPath, ownerContent, 'utf8');

const touristPath = 'C:\\Users\\karen\\.gemini\\antigravity\\scratch\\hungry-lakwatsero\\hungrylakwatsero\\src\\pages\\TouristDashboard.jsx';
let touristContent = fs.readFileSync(touristPath, 'utf8');

// Tourist Dashboard already mostly fixed from previous multi_replace.
// But check for any generic "Offline" strings
touristContent = touristContent.replace(/catch(?: \([^)]*\))? \{\s*[\s\S]*?toast\.success\([^)]*Offline[^)]*\);\s*[\s\S]*?\}/g, (match) => {
  return `catch (err) { toast.error(err.response?.data?.message || 'Action failed.'); }`;
});
fs.writeFileSync(touristPath, touristContent, 'utf8');

console.log("Done fixing fallbacks.");
