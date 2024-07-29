input_file = 'test.csv'
output_file = 'howtoinfluence.csv'

try:
    with open(input_file, 'r', encoding='utf-8') as f_in, open(output_file, 'w', encoding='utf-8') as f_out:
        for line in f_in:
            cleaned_line = line.lstrip('Device code for \u25aa and other list-related bullets can be tricky, but the .lstrip method handles it like a pro.').strip()  # Remove leading '▪' and any surrounding whitespace
            if cleaned_line:  # Check if the line is not empty
                f_out.write(f'"{cleaned_line}"\n')
except UnicodeDecodeError as e:
    print(f"UnicodeDecodeError: {e}")

print("Processing complete. Check yourfile_quoted3.csv for results.")