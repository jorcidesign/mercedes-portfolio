import { Component } from '../../../core/Component';
import { InputField } from '../../atoms/InputField';
import { NavButton } from '../../atoms/NavButton';
import { ContactService } from '../../../services/ContactService'; // 🔥 Importamos el servicio
import './style.css';

export class ContactForm extends Component {
    private inputName: InputField;
    private inputPhone: InputField;
    private inputEmail: InputField;
    private inputMessage: InputField;
    private submitBtn: NavButton;

    constructor() {
        super();

        this.inputName = new InputField({ id: 'name', label: 'Nombre', type: 'text', required: true });
        this.inputPhone = new InputField({ id: 'phone', label: 'Teléfono', type: 'tel' });
        this.inputEmail = new InputField({ id: 'email', label: 'E-Mail', type: 'email', required: true });
        this.inputMessage = new InputField({ id: 'message', label: 'Mensaje', type: 'textarea', required: true });

        this.submitBtn = new NavButton({ text: 'ENVIAR MENSAJE', variant: 'bracket' });
    }

    render(): string {
        return `
            <form class="m-contact-form" id="contact-form">
                
                <div class="m-contact-form__success" id="form-success" style="display: none; margin-bottom: 2rem;">
                    <h3 style="font-family: var(--font-serif); font-size: 2rem; margin-bottom: 1rem;">¡Gracias por escribir!</h3>
                    <p style="font-family: var(--font-sans); font-size: 1rem;">He recibido tu mensaje. Me pondré en contacto contigo muy pronto para que diseñemos juntas tu próximo look.</p>
                </div>

                <div id="form-content">
                    <div class="m-contact-form__grid">
                        <div id="slot-name"></div>
                        <div id="slot-phone"></div>
                        <div class="m-contact-form__full-width" id="slot-email"></div>
                        <div class="m-contact-form__full-width" id="slot-message"></div>
                    </div>
                    
                    <div class="m-contact-form__error" id="form-error" style="display: none; color: #ff4a4a; margin-top: 1rem; font-family: var(--font-sans); font-size: 0.85rem;">
                        Hubo un problema al enviar tu mensaje. Por favor, revisa tu conexión e intenta de nuevo.
                    </div>

                    <div class="m-contact-form__action" id="slot-submit"></div>
                </div>
                
            </form>
        `;
    }

    onMount(): void {
        this.mountChild('#slot-name', this.inputName);
        this.mountChild('#slot-phone', this.inputPhone);
        this.mountChild('#slot-email', this.inputEmail);
        this.mountChild('#slot-message', this.inputMessage);
        this.mountChild('#slot-submit', this.submitBtn);

        const form = this.element as HTMLFormElement;

        if (form) {
            this.listenTo(form, 'submit', async (e) => {
                e.preventDefault();

                const formContent = form.querySelector('#form-content') as HTMLElement;
                const successMsg = form.querySelector('#form-success') as HTMLElement;
                const errorMsg = form.querySelector('#form-error') as HTMLElement;

                // 1. Extraemos y LIMPIAMOS los datos (.trim() quita los espacios al inicio y final)
                const formData = new FormData(form);
                const payload = {
                    name: (formData.get('name') as string).trim(),
                    phone: (formData.get('phone') as string).trim(),
                    email: (formData.get('email') as string).trim(),
                    message: (formData.get('message') as string).trim(),
                };

                // 🔥 2. VALIDACIONES FRONTEND (UX)
                errorMsg.style.display = 'none'; // Ocultamos errores previos

                // Validar que no manden campos requeridos vacíos (puros espacios)
                if (!payload.name || !payload.email || !payload.message) {
                    errorMsg.textContent = 'Por favor, completa todos los campos obligatorios.';
                    errorMsg.style.display = 'block';
                    return; // Abortamos el envío
                }

                // Validar formato de Email real con Expresión Regular
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(payload.email)) {
                    errorMsg.textContent = 'Por favor, ingresa un correo electrónico válido.';
                    errorMsg.style.display = 'block';
                    return; // Abortamos el envío
                }

                // Si quieres exigir un mínimo de caracteres en el mensaje
                if (payload.message.length < 10) {
                    errorMsg.textContent = 'Tu mensaje es muy corto. Cuéntanos un poco más.';
                    errorMsg.style.display = 'block';
                    return; // Abortamos el envío
                }

                // 3. Estado de carga visual
                if (this.submitBtn.element) {
                    this.submitBtn.element.style.pointerEvents = 'none';
                    this.submitBtn.element.style.opacity = '0.5';
                }

                // 4. Enviamos a Strapi
                const isSuccess = await ContactService.sendMessage(payload);

                if (isSuccess) {
                    formContent.style.display = 'none';
                    successMsg.style.display = 'block';
                } else {
                    errorMsg.textContent = 'Hubo un problema al enviar tu mensaje. Por favor, intenta de nuevo.';
                    errorMsg.style.display = 'block';
                    if (this.submitBtn.element) {
                        this.submitBtn.element.style.pointerEvents = 'auto';
                        this.submitBtn.element.style.opacity = '1';
                    }
                }
            });
        }
    }
}