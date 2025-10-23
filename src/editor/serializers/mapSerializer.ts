import { DitaMap, MapNode } from '../../models/Map';

export class MapSerializer {
  toXml(map: DitaMap): string {
    const titleAttr = map.title ? ` title="${this.escapeXml(map.title)}"` : '';
    const childrenXml = map.root.children.map((child) => this.nodeToXml(child, 1)).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE map PUBLIC "-//OASIS//DTD DITA Map//EN" "map.dtd">
<map id="${map.id}"${titleAttr}>
${childrenXml}
</map>`;
  }

  private nodeToXml(node: MapNode, indent: number): string {
    const spaces = '  '.repeat(indent);
    const navtitleAttr = node.navtitle ? ` navtitle="${this.escapeXml(node.navtitle)}"` : '';
    const hrefAttr = node.href ? ` href="${this.escapeXml(node.href)}"` : '';

    if (node.children.length === 0) {
      return `${spaces}<topicref${navtitleAttr}${hrefAttr}/>`;
    }

    const childrenXml = node.children.map((child) => this.nodeToXml(child, indent + 1)).join('\n');
    return `${spaces}<topicref${navtitleAttr}${hrefAttr}>\n${childrenXml}\n${spaces}</topicref>`;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  fromXml(_xml: string): DitaMap {
    // Simplified parser for MVP
    throw new Error('XML parsing not implemented in MVP');
  }
}

export const mapSerializer = new MapSerializer();
