'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Phone, X } from 'lucide-react';
import Icon from '@/components/common/Icon';
import type { Person } from '@/types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  groom: Person;
  bride: Person;
}

export default function ContactModal({ isOpen, onClose, groom, bride }: ContactModalProps) {
  const [copiedContact, setCopiedContact] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = 'unset';
      return;
    }

    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copyToClipboard = async (text: string | undefined, contactType: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedContact(contactType);
      setTimeout(() => setCopiedContact(null), 1500);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('복사에 실패했습니다.');
    }
  };

  const ContactRow = ({
    label,
    name,
    phone,
    contactType,
  }: {
    label: string;
    name: string;
    phone?: string;
    contactType: string;
  }) => (
    <div className="grid grid-cols-[82px_1fr_auto] items-center gap-3 border-b border-wedding-brown/20 px-4 py-3 last:border-b-0">
      <span className="text-xs text-wedding-beige/80">{label}</span>
      <span className="text-sm font-medium text-wedding-beige">{name}</span>
      <div className="flex items-center gap-2">
        {phone ? (
          <>
            <a
              href={`tel:${phone}`}
              className="rounded-full bg-wedding-beige/15 p-2 hover:bg-wedding-beige/25"
              aria-label={`${name}에게 전화하기`}
            >
              <Icon icon={Phone} size="sm" className="text-wedding-beige" />
            </a>
            <button
              onClick={() => copyToClipboard(phone, contactType)}
              className="rounded-full bg-wedding-beige/15 p-2 hover:bg-wedding-beige/25"
              aria-label={`${name} 연락처 복사하기`}
            >
              {copiedContact === contactType ? (
                <Icon icon={Check} size="sm" className="text-green-300" />
              ) : (
                <Icon icon={Copy} size="sm" className="text-wedding-beige" />
              )}
            </button>
          </>
        ) : (
          <span className="px-2 text-[11px] text-wedding-beige/50">N/A</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-wedding-brown shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-wedding-beige/20 p-2 hover:bg-wedding-beige/30"
          aria-label="닫기"
        >
          <Icon icon={X} size="md" className="text-wedding-beige" />
        </button>

        <div className="border-b border-wedding-beige/20 px-6 py-6 text-center">
          <p className="text-sm tracking-[0.24em] text-wedding-beige/70">CONTACT</p>
          <h3 className="mt-2 text-lg font-semibold text-wedding-beige">양가 연락처 안내</h3>
        </div>

        <div className="max-h-[70dvh] overflow-y-auto modal-scrollbar px-6 py-5">
          <div className="mb-5">
            <h4 className="mb-2 text-sm font-semibold text-wedding-beige">신랑측</h4>
            <div className="overflow-hidden rounded-lg bg-wedding-brown/40">
              <ContactRow label="신랑" name={groom.name} phone={groom.contact} contactType="groom" />
              <ContactRow
                label="신랑 아버지"
                name={groom.parents?.father || '-'}
                phone={groom.parents?.fatherContact}
                contactType="groom-father"
              />
              <ContactRow
                label="신랑 어머니"
                name={groom.parents?.mother || '-'}
                phone={groom.parents?.motherContact}
                contactType="groom-mother"
              />
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-wedding-beige">신부측</h4>
            <div className="overflow-hidden rounded-lg bg-wedding-brown/40">
              <ContactRow label="신부" name={bride.name} phone={bride.contact} contactType="bride" />
              <ContactRow
                label="신부 아버지"
                name={bride.parents?.father || '-'}
                phone={bride.parents?.fatherContact}
                contactType="bride-father"
              />
              <ContactRow
                label="신부 어머니"
                name={bride.parents?.mother || '-'}
                phone={bride.parents?.motherContact}
                contactType="bride-mother"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
