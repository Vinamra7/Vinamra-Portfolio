export const INITIAL_PYTHON_CODE = `# Run this code to connect with me!
import webbrowser

def open_link(choice):
    links = {
        1: "mailto:mishravinamra5@gmail.com",
        2: "https://wa.me/+919173255769",
        3: "https://www.linkedin.com/in/vinamra-mishra-10597420a/"
    }
    webbrowser.open(links.get(choice, "Invalid choice"))

print("Choose an option:")
print("1: Open email to mishravinamra5@gmail.com")
print("2: Open WhatsApp to +919173255769")
print("3: Open LinkedIn profile of Vinamra Mishra")

choice = int(input("Enter 1, 2, or 3: "))
open_link(choice)`;
