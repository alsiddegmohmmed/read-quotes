input_file = 'test.csv'
output_file = 'yourfile_quoted2.csv'

with open(input_file, 'r') as f_in, open(output_file, 'w') as f_out:
    for line in f_in:
        cleaned_line = line.lstrip('▪').strip()  # Remove leading '▪' and any surrounding whitespace
        if cleaned_line:  # Check if the line is not empty
            f_out.write(f'"{cleaned_line}"\n')
