"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Phone, X } from "lucide-react";
import Icon from "@/components/common/Icon";
import useModalLayer from "@/hooks/useModalLayer";
import type { Person } from "@/types";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  groom: Person;
  bride: Person;
}

export default function ContactModal({
  isOpen,
  onClose,
  groom,
  bride,
}: ContactModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useModalLayer({
    active: isOpen,
    onEscape: onClose,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus({ preventScroll: true });
  }, [isOpen]);

  if (!isMounted || !isOpen) return null;

  const groomContactRows = [
    {
      label: "신랑",
      name: groom.name,
      phone: groom.contact,
      contactType: "groom",
    },
    ...(groom.parents?.father?.trim() || groom.parents?.fatherContact?.trim()
      ? [
          {
            label: "신랑 아버지",
            name: groom.parents?.father ?? "신랑 아버지",
            phone: groom.parents?.fatherContact,
            contactType: "groom-father",
          },
        ]
      : []),
    ...(groom.parents?.mother?.trim() || groom.parents?.motherContact?.trim()
      ? [
          {
            label: "신랑 어머니",
            name: groom.parents?.mother ?? "신랑 어머니",
            phone: groom.parents?.motherContact,
            contactType: "groom-mother",
          },
        ]
      : []),
  ];

  const brideContactRows = [
    {
      label: "신부",
      name: bride.name,
      phone: bride.contact,
      contactType: "bride",
    },
    ...(bride.parents?.father?.trim() || bride.parents?.fatherContact?.trim()
      ? [
          {
            label: "신부 아버지",
            name: bride.parents?.father ?? "신부 아버지",
            phone: bride.parents?.fatherContact,
            contactType: "bride-father",
          },
        ]
      : []),
    ...(bride.parents?.mother?.trim() || bride.parents?.motherContact?.trim()
      ? [
          {
            label: "신부 어머니",
            name: bride.parents?.mother ?? "신부 어머니",
            phone: bride.parents?.motherContact,
            contactType: "bride-mother",
          },
        ]
      : []),
  ];

  const ContactRow = ({
    label,
    name,
    phone,
  }: {
    label: string;
    name: string;
    phone?: string;
  }) => (
    <div className="grid grid-cols-[82px_1fr_auto] items-center gap-3 border-b border-wedding-brown/20 px-4 py-3 last:border-b-0">
      <span className="text-xs text-wedding-beige/80">{label}</span>
      <span className="text-sm pl-4 font-medium text-wedding-beige">
        {name}
      </span>
      <div className="flex items-center gap-2">
        {phone ? (
          <a
            href={`tel:${phone}`}
            className="rounded-full bg-wedding-beige/15 p-2 hover:bg-wedding-beige/25"
            aria-label={`${name}에게 전화하기`}
          >
            <Icon icon={Phone} size="sm" className="text-wedding-beige" />
          </a>
        ) : (
          <span className="px-2 text-[11px] text-wedding-beige/50">N/A</span>
        )}
      </div>
    </div>
  );

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="absolute inset-0 z-0 bg-black/60 backdrop-blur-sm" />

      <motion.div
        className="relative z-10 w-[423px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-wedding-brown shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        initial={{ y: 20, opacity: 0.82 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          type="button"
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-wedding-beige/20 p-2 hover:bg-wedding-beige/30"
          aria-label="닫기"
        >
          <Icon icon={X} size="md" className="text-wedding-beige" />
        </button>

        <div className="border-b border-wedding-beige/20 px-6 py-6 ">
          <p className="text-sm tracking-[0.24em] text-wedding-beige/70">
            CONTACT
          </p>
          <h3 className="mt-2 text-lg font-semibold text-wedding-beige">
            양가 연락처 안내
          </h3>
        </div>

        <div className="max-h-[70dvh] overflow-y-auto modal-scrollbar pl-6 pr-2 py-5">
          <div className="mb-5">
            <h4 className="mb-2 text-sm font-semibold text-wedding-beige">
              신랑측
            </h4>
            <div className="overflow-hidden rounded-lg bg-wedding-brown/40">
              {groomContactRows.map((row) => (
                <ContactRow
                  key={row.contactType}
                  label={row.label}
                  name={row.name}
                  phone={row.phone}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-wedding-beige">
              신부측
            </h4>
            <div className="overflow-hidden rounded-lg bg-wedding-brown/40">
              {brideContactRows.map((row) => (
                <ContactRow
                  key={row.contactType}
                  label={row.label}
                  name={row.name}
                  phone={row.phone}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
