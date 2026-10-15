import React, { useEffect, useId, useRef, useState } from "react";
import { FaCheck, FaChevronDown } from "react-icons/fa";
import { cx } from "../utils";

export default function Select({ value, onChange, options, placeholder, icon }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef(null);
  const listId = useId();
  const selected = options.find(opt => opt.value === value);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open && active >= 0) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, listId]);

  const openList = () => {
    setActive(Math.max(0, options.findIndex(opt => opt.value === value)));
    setOpen(true);
  };

  const choose = (opt) => {
    onChange(opt.value);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive(i => Math.min(i + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive(i => Math.max(i - 1, 0));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (options[active]) choose(options[active]);
        break;
      case "Escape":
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <div className="select" ref={rootRef}>
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        className={cx("input select__trigger", !selected && "select__trigger--placeholder")}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        {icon && <span className="select__icon">{icon}</span>}
        <span className="select__value">{selected?.label ?? placeholder}</span>
        <FaChevronDown className={cx("select__chevron", open && "select__chevron--open")} />
      </button>

      {open && (
        <ul className="select__list" role="listbox" id={listId}>
          {options.length === 0 && <li className="select__empty">Nenhuma opção disponível</li>}
          {options.map((opt, i) => (
            <li
              key={opt.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={opt.value === value}
              className={cx(
                "select__option",
                i === active && "select__option--active",
                opt.value === value && "select__option--selected",
              )}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(opt)}
            >
              {opt.label}
              {opt.value === value && <FaCheck className="select__check" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
