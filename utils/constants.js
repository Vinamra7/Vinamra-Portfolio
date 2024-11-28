export const INITIAL_PYTHON_CODE = `# 🌟 Run this code to connect with me! 🌟
import webbrowser

links = {
    1: "mailto:mishravinamra5@gmail.com",
    2: "https://wa.me/+919173255769",
    3: "https://www.linkedin.com/in/vinamra-mishra-10597420a/"
}

print("\\n✨ How would you like to connect with me? ✨")
print("🚀 Choose an option:")
print("1️⃣ Send me an email 📧\\n2️⃣ Message me on WhatsApp 💬\\n3️⃣ Visit my LinkedIn profile 🌐")

try:
    choice = int(input("\\n👉 Enter 1, 2, or 3 and press Enter 😊:"))
    if choice not in links:
        print("❌ Invalid choice. Please try again!")
    else: webbrowser.open(links.get(choice, ""))
except ValueError:
    print("❌ Please enter a valid number (1, 2, or 3).")
`;
