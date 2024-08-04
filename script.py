import csv

input_file = 'what.txt'  # Update this path as needed
output_file = 'extracted_quotes.csv'

def extract_book_info_and_quotes(content):
    lines = content.split('\n')
    book_title_author = ""
    quotes = []

    # Extract book title and author from line six (index 5)
    if len(lines) >= 6:
        book_title_author = lines[5].strip()
    else:
        raise ValueError("The file does not contain enough lines to extract the book title.")

    # Split book title and author if they are together
    if ',' in book_title_author:
        book_title, author = map(str.strip, book_title_author.split(',', 1))
    else:
        book_title = book_title_author
        author = "Unknown Author"

    # Set to track unique quotes
    seen_quotes = set()

    for line in lines:
        stripped_line = line.strip()
        # Skip lines that are metadata, contain file paths, or start with numeric values
        if (stripped_line and not stripped_line.startswith(('indent:', 'trim:', '/', '#', '0')) 
            and not stripped_line.isdigit()
            and stripped_line != book_title_author
            and stripped_line != book_title):
            
            # Add quotes to the set to ensure uniqueness and avoid book titles
            if stripped_line not in seen_quotes and book_title not in stripped_line:
                seen_quotes.add(stripped_line)
                quotes.append(stripped_line)

    return book_title, author, quotes

try:
    with open(input_file, 'r', encoding='utf-8') as f_in:
        content = f_in.read()

    book_title, author, quotes = extract_book_info_and_quotes(content)

    with open(output_file, 'w', newline='', encoding='utf-8') as f_out:
        writer = csv.writer(f_out)
        writer.writerow(['Quote', 'bookTitle', 'Author'])  # Write header

        for quote in quotes:
            writer.writerow([quote, book_title, author])

    print("Processing complete. Check extracted_quotes.csv for results.")
except UnicodeDecodeError as e:
    print(f"UnicodeDecodeError: {e}")
except FileNotFoundError as e:
    print(f"FileNotFoundError: {e}")
except Exception as e:
    print(f"An error occurred: {e}")
