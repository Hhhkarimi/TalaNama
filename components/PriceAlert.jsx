"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, BellRing, ChevronDown } from "lucide-react";
import { formatFa } from "@/lib/goldData";
import { hasCrossedPrice, normalizePriceAlert } from "@/lib/priceAlert";

const STORAGE_KEY = "talanama-price-alert-v1";

function defaultTarget(currentPrice) {
  if (!Number.isFinite(currentPrice) || currentPrice <= 0) return 0;
  return Math.round((currentPrice * 1.03) / 10000) * 10000;
}

function loadAlert(currentPrice) {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    if (stored && Number.isFinite(stored.target)) {
      return normalizePriceAlert(stored, defaultTarget(currentPrice));
    }
  } catch {
    // Ignore invalid local preferences and use a safe default.
  }
  return { enabled: false, direction: "above", target: defaultTarget(currentPrice), lastTriggeredAt: null };
}

export default function PriceAlert({ currentPrice, updatedAt, sourceStatus }) {
  const [alert, setAlert] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("هشدار در همین مرورگر ذخیره می‌شود");
  const previousPrice = useRef(currentPrice);

  useEffect(() => {
    setAlert(loadAlert(currentPrice));
  }, [currentPrice]);

  useEffect(() => {
    if (!alert) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(alert));
  }, [alert]);

  useEffect(() => {
    if (!alert?.enabled || !Number.isFinite(currentPrice) || !Number.isFinite(previousPrice.current)) {
      previousPrice.current = currentPrice;
      return;
    }

    const crossed = hasCrossedPrice({
      previous: previousPrice.current,
      current: currentPrice,
      target: alert.target,
      direction: alert.direction
    });
    previousPrice.current = currentPrice;

    if (!crossed) return;
    const triggeredAt = updatedAt || new Date().toISOString();
    if (alert.lastTriggeredAt === triggeredAt) return;

    const directionText = alert.direction === "above" ? "بالاتر از" : "پایین‌تر از";
    const notificationText = `طلای ۱۸ عیار ${directionText} ${formatFa(alert.target)} تومان قرار گرفت.`;
    setAlert((current) => ({ ...current, lastTriggeredAt: triggeredAt }));
    setMessage(notificationText);

    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("هشدار قیمت طلانما", { body: notificationText, tag: "talanama-price-alert" });
      } catch {
        // Some mobile browsers require a service worker; the in-app message still works.
      }
    }
  }, [alert, currentPrice, updatedAt]);

  if (!alert) {
    return (
      <div className="sidebar-watch alert-loading" aria-live="polite">
        <div className="watch-icon"><Bell size={17} /></div>
        <div><b>هشدار قیمت</b><small>در حال آماده‌سازی...</small></div>
      </div>
    );
  }

  const toggleAlert = async () => {
    const nextEnabled = !alert.enabled;
    if (nextEnabled && "Notification" in window && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {
        // In-app alert remains available even when browser notifications fail.
      }
    }
    setAlert((current) => ({ ...current, enabled: nextEnabled }));
    setExpanded(nextEnabled || expanded);
    setMessage(nextEnabled ? "هشدار فعال شد؛ عبور قیمت از سطح بررسی می‌شود" : "هشدار غیرفعال شد");
  };

  const sourceAllowsCheck = sourceStatus === "live" || sourceStatus === "partial";

  return (
    <div className="sidebar-watch price-alert-widget">
      <div className="price-alert-row">
        <div className="watch-icon">{alert.enabled ? <BellRing size={17} /> : <Bell size={17} />}</div>
        <button
          type="button"
          className="price-alert-summary"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls="price-alert-settings"
        >
          <span><b>هشدار قیمت</b><small>{alert.enabled ? `${alert.direction === "above" ? "بالاتر از" : "پایین‌تر از"} ${formatFa(alert.target)} تومان` : "برای طلای ۱۸ عیار"}</small></span>
          <ChevronDown size={14} className={expanded ? "expanded" : ""} />
        </button>
        <button
          type="button"
          className={`switch ${alert.enabled ? "active" : ""}`}
          aria-label={alert.enabled ? "غیرفعال‌سازی هشدار" : "فعال‌سازی هشدار"}
          aria-pressed={alert.enabled}
          onClick={toggleAlert}
        >
          <span />
        </button>
      </div>

      {expanded && (
        <div className="price-alert-settings" id="price-alert-settings">
          <label>
            <span>شرط هشدار</span>
            <select value={alert.direction} onChange={(event) => setAlert((current) => ({ ...current, direction: event.target.value }))}>
              <option value="above">عبور به بالاتر</option>
              <option value="below">عبور به پایین‌تر</option>
            </select>
          </label>
          <label>
            <span>قیمت هدف (تومان)</span>
            <input
              type="number"
              min="1"
              step="10000"
              value={alert.target || ""}
              onChange={(event) => setAlert((current) => ({ ...current, target: Math.max(0, Number(event.target.value)) }))}
            />
          </label>
          <small className={sourceAllowsCheck ? "" : "warning"} aria-live="polite">{sourceAllowsCheck ? message : "منبع جاری در حالت پشتیبان است؛ عبور قیمت پس از دریافت داده تازه بررسی می‌شود."}</small>
        </div>
      )}
    </div>
  );
}
