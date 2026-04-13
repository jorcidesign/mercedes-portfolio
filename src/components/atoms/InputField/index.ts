import { Component } from '../../../core/Component';
import './style.css';

interface InputFieldProps {
    id: string;
    label: string;
    type?: 'text' | 'email' | 'tel' | 'textarea';
    required?: boolean;
}

export class InputField extends Component<InputFieldProps> {
    constructor(props: InputFieldProps) {
        super({ type: 'text', required: false, ...props });
    }

    render(): string {
        const { id, label, type, required } = this.props;
        const reqAttr = required ? 'required' : '';

        if (type === 'textarea') {
            return `
                <div class="a-input-field">
                    <label class="a-input-field__label" for="${id}">${label}</label>
                    <textarea class="a-input-field__control a-input-field__control--area" id="${id}" name="${id}" ${reqAttr}></textarea>
                </div>
            `;
        }

        return `
            <div class="a-input-field">
                <label class="a-input-field__label" for="${id}">${label}</label>
                <input class="a-input-field__control" type="${type}" id="${id}" name="${id}" ${reqAttr} />
            </div>
        `;
    }

    onMount(): void {
        const input = this.element?.querySelector('.a-input-field__control') as HTMLInputElement;
        if (!input) return;

        // 🔥 UX: Si es teléfono, solo permitimos números, espacios, guiones y el símbolo +
        if (this.props.type === 'tel') {
            this.listenTo(input, 'input', (e) => {
                const target = e.target as HTMLInputElement;
                // Expresión regular que borra cualquier cosa que NO sea un número, '+', '-' o espacio
                target.value = target.value.replace(/[^0-9+\-\s]/g, '');
            });
        }
    }
}