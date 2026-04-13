import { Component } from '../../../core/Component';
import './style.css';

export class ScrollArrow extends Component {
    render(): string {
        return `
            <div class="a-scroll-arrow">
                <svg 
                    class="a-scroll-arrow__svg" 
                    viewBox="0 0 30 16" 
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                >
                    <path d="M27.81 2.84a1 1 0 0 0-1.32-.52c-.21.09-5 2.29-11.6 11.23C8.3 4.61 3.5 2.41 3.3 2.32a1 1 0 0 0-.81 1.83s5 2.3 11.59 11.67c0 0 .07 0 .1.08a.66.66 0 0 0 .14.15h.07l.11.06a1.1 1.1 0 0 0 .39.09 1.1 1.1 0 0 0 .39-.09l.1-.06h.08a1 1 0 0 0 .14-.15s.08-.05.1-.08C22.34 6.47 27.24 4.18 27.3 4.15a1 1 0 0 0 .51-1.31z"></path>
                </svg>
            </div>
        `;
    }
}