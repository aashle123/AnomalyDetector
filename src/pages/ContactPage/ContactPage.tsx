import { useState } from 'react';
import styles from './ContactPage.module.css';

export function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        alert('Thank you for your message! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const contactInfo = [
        { title: 'Email', text: 'support@healthai.example.com' },
        { title: 'Location', text: 'United Kingdom' },
        { title: 'Response Time', text: 'Within 24-48 hours' },
        { title: 'Data Protection', text: 'UK GDPR Compliant' },
    ];

    return (
        <div className={styles.contact}>
            <div className={styles.contactCard}>
                {/* Header */}
                <div className={styles.contactHeader}>
                    <span className={styles.contactPlus}>+</span>
                    <h1 className={styles.contactTitle}>Get in Touch</h1>
                    <p className={styles.contactSubtitle}>
                        Have questions about HealthAI? We'd love to hear from you.
                        Send us a message and we'll respond as soon as possible.
                    </p>
                </div>

                {/* Main Content */}
                <div className={styles.contactGrid}>
                    {/* Contact Information */}
                    <div className={styles.contactInfo}>
                        {contactInfo.map((item, idx) => (
                            <div key={idx} className={styles.infoItem}>
                                <span className={styles.infoNumber}>0{idx + 1}</span>
                                <div className={styles.infoContent}>
                                    <h3 className={styles.infoTitle}>{item.title}</h3>
                                    <p className={styles.infoText}>{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name" className={styles.label}>
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Your name"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.label}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="subject" className={styles.label}>
                                Subject
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="How can we help?"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="message" className={styles.label}>
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                className={styles.textarea}
                                placeholder="Tell us more about your inquiry..."
                                required
                            />
                        </div>
                        <button type="submit" className={styles.submitBtn}>
                            SEND MESSAGE
                            <span className={styles.submitArrow}>→</span>
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className={styles.contactFooter}>
                    <p className={styles.footerText}>
                        Your data is protected under UK GDPR regulations.
                    </p>
                    <a href="/privacy" className={styles.footerLink}>
                        View Privacy Policy
                    </a>
                </div>
            </div>
        </div>
    );
}

export default ContactPage;
