import { ReminderApp } from "./components/ReminderApp";
import { SettingsApp } from "./components/SettingsApp";

export default function App({ isReminder }: { isReminder: boolean }) {
  return isReminder ? <ReminderApp /> : <SettingsApp />;
}
