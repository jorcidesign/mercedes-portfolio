// index.ts completo para el componente WorkCredits

import { Component } from '../../../core/Component';
import type { WorkCredit } from '../../../data/works';
import './style.css';

interface WorkCreditsProps {
    credits: WorkCredit[];
    nextWork?: { slug: string; title: string; imageUrl: string } | null;
}

export class WorkCredits extends Component<WorkCreditsProps> {
    render(): string {
        const { credits } = this.props;

        const creditsHtml = credits && credits.length > 0 ? `
            <div class="m-work-credits__list">
                ${credits.map(credit => `
                    <div class="m-work-credits__item">
                        <span class="m-work-credits__role">${credit.role}</span>
                        <a href="${credit.url}" target="_blank" rel="noopener noreferrer" class="m-work-credits__name">
                            ${credit.name}
                        </a>
                    </div>
                `).join('')}
            </div>
        ` : '';


        return `
            <div class="m-work-credits">
                ${creditsHtml}
            </div>
        `;
    }
}