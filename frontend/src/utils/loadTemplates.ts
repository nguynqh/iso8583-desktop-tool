interface Template {
    name : string;
    fileName : string;
    data : any;
}

function importAll(r: __WebpackModuleApi.RequireContext): Template[] {
  const templates: Template[] = [];
  
  r.keys().forEach((fileName: string) => {
    const template = r(fileName);
    const cleanFileName = fileName.replace('./', '');
    const displayName = cleanFileName
      .replace('.json', '')
      .replace(/[-_]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    templates.push({
      name: displayName,
      fileName: cleanFileName,
      data: template.default || template
    });
  });
  
  return templates.sort((a, b) => a.name.localeCompare(b.name));
}

export function loadAllTemplates(): Template[] {
  try {
    // Load tất cả file .json từ thư mục templates
    const context = require.context('../templates', false, /\.json$/);
    return importAll(context);
  } catch (error) {
    console.error('Error loading templates:', error);
    return [];
  }
}