import { Component } from '../../../core/Component';
import './style.css';

interface WorkInfoProps {
    title: string;
    category: string;
    date: string;
    description: string;
    href?: string;
}

export class WorkInfo extends Component<WorkInfoProps> {
    render(): string {
        const { title, category, date, description, href } = this.props;

        // Si hay link, el título es <a>, si no, es <h3>
        const titleHtml = href
            ? `<a href="${href}" class="a-work-info__title">${title}</a>`
            : `<h3 class="a-work-info__title">${title}</h3>`;

        return `
            <div class="a-work-info">
                <div class="a-work-info__meta">
                    <span class="a-work-info__category">${category}</span>
                    <span class="a-work-info__date">{${date}}</span>
                </div>
                
                ${titleHtml}
                
                <p class="a-work-info__desc">${description}</p>
            </div>
        `;
    }
}