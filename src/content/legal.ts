// Privacy policy and terms. General templates — have them reviewed by a
// legal adviser in Bahrain and replace [LEGAL ENTITY NAME] before launch.
import { site } from './site';

export type LegalSection = { id: string; title: string; paras: string[] };

export const legalUpdated = '30 October 2026';

const contactLine = `WhatsApp ${site.whatsappDisplay} · Tel ${site.phoneDisplay} · ${site.locationShort}, Kingdom of Bahrain.`;

export const privacy: { intro: string; sections: LegalSection[] } = {
  intro: 'This policy explains what personal information KLUB360° collects through this website and at the venue, how we use it, and the choices you have.',
  sections: [
    { id: 'who', title: 'Who we are', paras: [
      `KLUB360° is a nightclub on the ground floor of the ${site.address}, operated by ${site.legalName} ("we", "us").`,
      'We are responsible for the personal information described in this policy.',
    ] },
    { id: 'collect', title: 'Information we collect', paras: [
      'Information you give us: your name, phone number, email address and message when you contact us; your name, contact details, position of interest and CV when you apply for a job; and your details when you join VIP Black membership.',
      'Booking enquiries and messages: our website opens WhatsApp with your request pre-written. Anything you send is shared with us through WhatsApp.',
      'Automatically collected information: basic technical data such as your device, browser and pages visited.',
      'At the venue: for the safety of guests and staff, security cameras operate inside and around the club, and ID may be checked to confirm you are over 21.',
    ] },
    { id: 'use', title: 'How we use your information', paras: [
      'To respond to enquiries and confirm table reservations; to manage VIP memberships and their benefits; to review job applications; to operate, secure and improve the website; to keep the venue safe; and to meet our legal obligations.',
      'With your consent, we may send you news about upcoming events. You can opt out at any time.',
    ] },
    { id: 'share', title: 'Sharing your information', paras: [
      'We do not sell your personal information.',
      'We may share it with service providers who help us run the website and our operations, with Elite Crystal Hotel where needed to deliver VIP benefits, and with authorities when required by law.',
      'Tickets for some events are sold by third-party platforms such as Platinumlist. Their own privacy policies apply to information you give them.',
    ] },
    { id: 'cookies', title: 'Cookies', paras: [
      'We use only the cookies needed for the website to work. If we add analytics in future, we will update this policy. You can control cookies through your browser settings.',
    ] },
    { id: 'retention', title: 'How long we keep it', paras: [
      'We keep personal information only as long as needed for the purpose it was collected, or as required by law. Job applications are kept for up to 12 months unless you ask us to delete them sooner.',
    ] },
    { id: 'rights', title: 'Your rights', paras: [
      "Under Bahrain's Personal Data Protection Law (Law No. 30 of 2018), you may ask to access the personal information we hold about you, correct it, have it deleted, or object to certain uses.",
      'To make a request, contact us using the details below. We may need to verify your identity first.',
    ] },
    { id: 'security', title: 'Security', paras: [
      'We use reasonable technical and organisational measures to protect your information. No method of transmission over the internet is completely secure.',
    ] },
    { id: 'changes', title: 'Changes to this policy', paras: [
      'We may update this policy from time to time. The date at the top shows when it was last changed.',
    ] },
    { id: 'contact', title: 'Contact us', paras: [contactLine] },
  ],
};

export const terms: { intro: string; sections: LegalSection[] } = {
  intro: 'By using this website, booking a table, buying a ticket or visiting KLUB360°, you agree to these terms. Please read them together with our admission policy and privacy policy.',
  sections: [
    { id: 'about', title: 'About these terms', paras: [
      `These terms apply to klub360bh.com and to KLUB360°, located on the ground floor of the ${site.locationShort}, Kingdom of Bahrain, operated by ${site.legalName}.`,
      'We may update these terms from time to time. The version on this page applies at the time of your visit or booking.',
    ] },
    { id: 'admission', title: 'Admission', paras: [
      `Entry is for guests aged 21 and over. Valid ID may be requested. A ${site.dress.toLowerCase()} dress code applies.`,
      'Management reserves the right to refuse admission or to ask any guest to leave, without giving a reason. Full details are in our admission policy.',
    ] },
    { id: 'tables', title: 'Table reservations', paras: [
      'A table request sent through our website or WhatsApp is not confirmed until our team confirms it with you.',
      'Minimum spend and other conditions may apply depending on the night and table. Tables may be released if your group has not arrived by the agreed time.',
    ] },
    { id: 'tickets', title: 'Tickets for events', paras: [
      'Tickets for some events are sold by third-party platforms such as Platinumlist. Their terms of sale, including refund rules, apply to those purchases.',
      'A ticket does not override our admission policy.',
    ] },
    { id: 'changes', title: 'Event changes', paras: [
      'Line-ups, set times and event details may change or be cancelled due to circumstances outside our control. We will share updates on our website and social channels where possible.',
    ] },
    { id: 'vip', title: 'VIP Black membership', paras: [
      'Membership is personal and non-transferable. Benefits are subject to availability and to their specific terms, and may be updated from time to time.',
      'Membership may be cancelled without refund if its terms or our house rules are breached.',
    ] },
    { id: 'conduct', title: 'Conduct at the venue', paras: [
      'Guests must respect staff, other guests and the venue. Behaviour that is unsafe, unlawful or disruptive may lead to removal and refusal of future entry.',
      'By attending, you accept that photos and videos may be taken at events and used on our website and social channels.',
    ] },
    { id: 'website', title: 'Use of this website', paras: [
      'All content on this website, including logos, artwork and photos, belongs to KLUB360° or its partners and may not be copied or reused without permission.',
      'Links to third-party websites are provided for convenience. We are not responsible for their content or practices.',
    ] },
    { id: 'liability', title: 'Liability', paras: [
      'To the extent permitted by law, we are not liable for indirect loss, or for loss of or damage to personal belongings at the venue.',
      'Nothing in these terms limits any rights you have under the laws of the Kingdom of Bahrain.',
    ] },
    { id: 'law', title: 'Governing law', paras: [
      'These terms are governed by the laws of the Kingdom of Bahrain, and the courts of Bahrain have jurisdiction over any disputes.',
    ] },
    { id: 'contact', title: 'Contact us', paras: [contactLine] },
  ],
};
