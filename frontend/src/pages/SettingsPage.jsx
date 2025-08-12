import { useThemeStore } from "../store/useThemeStore";
import { THEMES } from "../constants";
import { Send } from "lucide-react";

const PREVIEW_MESSAGES = [
  {id: 1, message: "Hey! How's it going?", isSent: false},
  {id: 2, message: "This is a preview message 2", isSent: true},
]

const SettingsPage = () => {
    const { theme, setTheme } = useThemeStore();

  return (
    <div className="h-screen container mx-auto px-4 pt-20 max-w-5xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Theme</h2>
          <p className="text-sm text-base-content/70">Choose a theme for your chat interface</p>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {THEMES.map((t) => (
            <button key={t} className={`group flex flex-col items-center gap-1.5 rounded-lg p-2 transition-colors ${theme === t ? "bg-base-300" : "hover:bg-base-200/5"}`} onClick={() => setTheme(t)}>
              <div className="relative h-8 w-full rounded-md overflow-hidden" data-theme={t}>
                <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                  <div className="rounded bg-primary"></div>
                  <div className="rounded bg-secondary"></div>
                  <div className="rounded bg-accent"></div>
                  <div className="rounded bg-neutral"></div>
                </div>
              </div>
              <span className="text-[11px] font-medium truncate w-full text-center">
                {t. charAt (0) . toUpperCase( ) + t. slice(1) }
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview Section */}
      {/* <h3 className="text-lg font-semibold mb-3">Preview</h3> */}
      {/* <div className="rounded-xl border border-base-300 overflow-hidden bg-base-100 shadow-lg">
        <div className="p-4 bg-base-200">
          <div className="max-w-lg mx-auto">
            <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-base-300 bg-base-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content font-medium">
                    J
                  </div>
                  <div>
                    <span className="text-sm font-medium">John Doe</span>
                    <span className="text-xs text-base-content/70">Last seen 5 minutes ago</span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex flex-col gap-2">
                  {PREVIEW_MESSAGES.map((msg) => (
                    <div key={msg.id} className={`flex items-center gap-2 ${msg.isSent ? "justify-end" : ""}`}>
                      <div className={`w-8 h-8 rounded-full ${msg.isSent ? "bg-primary" : "bg-secondary"} flex items-center justify-center text-primary-content font-medium`}>
                        {msg.isSent ? "Me" : "J"}
                      </div>
                      <div className={`p-2 rounded-lg ${msg.isSent ? "bg-primary" : "bg-secondary"} text-sm`}>
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div> */}
    </div>
  )
}

export default SettingsPage

