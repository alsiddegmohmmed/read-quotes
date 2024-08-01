import csv
import re

input_file = 'Maybe_You_Should_Talk_to_Someone.txt'
output_file = 'extracted_quotes.csv'
book_title = "Maybe You Should Talk to Someone"
author = "Lori Gottlieb"

def extract_quotes(content):
    lines = content.split('\n')
    quotes = []
    current_quote = ""
    
    for line in lines:
        stripped_line = line.strip()
        # Skip unwanted lines containing file paths or empty lines
        if re.match(r'^/sdcard|^Maybe You Should Talk to Someone$', stripped_line):
            continue
        # Check if the line is part of a quote
        if stripped_line and not stripped_line.startswith('#') and not stripped_line.isdigit():
            current_quote += " " + stripped_line
        # Check if the line is empty indicating the end of a quote
        elif current_quote:
            quotes.append(current_quote.strip())
            current_quote = ""
    
    # Add the last quote if any
    if current_quote:
        quotes.append(current_quote.strip())
    
    return quotes

try:
    with open(input_file, 'r', encoding='utf-8') as f_in:
        content = f_in.read()
    
    quotes = extract_quotes(content)
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f_out:
        writer = csv.writer(f_out)
        writer.writerow(['Quote', 'Title', 'Author'])  # Write header
        
        for quote in quotes:
            writer.writerow([f'"{quote}"', book_title, author])
    
    print("Processing complete. Check extracted_quotes.csv for results.")
except UnicodeDecodeError as e:
    print(f"UnicodeDecodeError: {e}")
except FileNotFoundError as e:
    print(f"FileNotFoundError: {e}")
except Exception as e:
    print(f"An error occurred: {e}")
