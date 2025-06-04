import os
import re
import json
import shutil
from pathlib import Path
from datetime import datetime

class ReactFileParser:
    def __init__(self, input_file_path, output_base_dir=None):
        """
        Initialize the parser with input file and optional output directory
        
        Args:
            input_file_path: Path to the input file containing React components
            output_base_dir: Base directory for output (default: current directory)
        """
        self.input_file_path = input_file_path
        self.output_base_dir = output_base_dir or os.getcwd()
        self.created_files = []
        self.created_dirs = set()
        self.errors = []
        
    def parse_file(self):
        """Parse the input file and extract file paths and code content"""
        try:
            with open(self.input_file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            raise Exception(f"Failed to read input file: {str(e)}")
        
        # Pattern to match the file sections
        pattern = r'## \d+\. ([\w/.-]+)\s*\n\s*```\w*\n(.*?)```'
        pattern2 = r'## \d+\. `([\w/.-]+)`\s*\n\s*```\w*\n(.*?)```'
        
        # Find all matches
        matches = re.findall(pattern, content, re.DOTALL)
        matches2 = re.findall(pattern2, content, re.DOTALL)
        
        
        return matches or matches2
    
    def create_backup(self):
        """Create a backup of existing files if they exist"""
        backup_dir = Path(self.output_base_dir) / f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Check if any files already exist
        existing_files = []
        matches = self.parse_file()
        
        for file_path, _ in matches:
            full_path = Path(self.output_base_dir) / file_path
            if full_path.exists():
                existing_files.append(full_path)
        
        # Create backup if needed
        if existing_files:
            print(f"\nFound {len(existing_files)} existing files. Creating backup...")
            backup_dir.mkdir(parents=True, exist_ok=True)
            
            for file_path in existing_files:
                relative_path = file_path.relative_to(self.output_base_dir)
                backup_path = backup_dir / relative_path
                backup_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(file_path, backup_path)
                print(f"Backed up: {relative_path}")
            
            print(f"Backup created at: {backup_dir}")
            return backup_dir
        
        return None
    
    def create_files(self, backup=True):
        """Create all files and directories"""
        # Create backup if requested
        if backup:
            self.create_backup()
        
        # Parse the input file
        matches = self.parse_file()
        
        if not matches:
            print("No file patterns found in the input file.")
            return
        
        print(f"\nFound {len(matches)} files to create\n")
        
        for file_path, code_content in matches:
            try:
                # Clean up the file path
                file_path = file_path.strip()
                
                # Create the full path
                full_path = Path(self.output_base_dir) / file_path
                
                # Create directories if they don't exist
                directory = full_path.parent
                if directory and not directory.exists():
                    directory.mkdir(parents=True, exist_ok=True)
                    self.created_dirs.add(str(directory.relative_to(self.output_base_dir)))
                    print(f"Created directory: {directory.relative_to(self.output_base_dir)}")
                
                # Write the file
                with open(full_path, 'w', encoding='utf-8') as f:
                    cleaned_content = code_content.strip()
                    f.write(cleaned_content)
                
                self.created_files.append(str(Path(file_path)))
                print(f"Created file: {file_path}")
                
            except Exception as e:
                error_msg = f"Failed to create {file_path}: {str(e)}"
                self.errors.append(error_msg)
                print(f"ERROR: {error_msg}")
    
    def generate_report(self):
        """Generate a report of the operation"""
        report = {
            "timestamp": datetime.now().isoformat(),
            "input_file": self.input_file_path,
            "output_directory": self.output_base_dir,
            "statistics": {
                "total_directories_created": len(self.created_dirs),
                "total_files_created": len(self.created_files),
                "total_errors": len(self.errors)
            },
            "created_directories": sorted(list(self.created_dirs)),
            "created_files": sorted(self.created_files),
            "errors": self.errors
        }
        
        # Save report as JSON
        report_path = Path(self.output_base_dir) / f"creation_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2)
        
        print(f"\nReport saved to: {report_path}")
        return report
    
    def print_summary(self):
        """Print a summary of the operation"""
        print("\n" + "="*60)
        print("SUMMARY")
        print("="*60)
        print(f"Total directories created: {len(self.created_dirs)}")
        print(f"Total files created: {len(self.created_files)}")
        print(f"Total errors: {len(self.errors)}")
        
        # List all created directories
        if self.created_dirs:
            print("\nCreated directories:")
            for dir_path in sorted(self.created_dirs):
                print(f"  - {dir_path}")
        
        # List all created files
        if self.created_files:
            print("\nCreated files:")
            for file_path in sorted(self.created_files):
                print(f"  - {file_path}")
        
        # List all errors
        if self.errors:
            print("\nErrors encountered:")
            for error in self.errors:
                print(f"  - {error}")
    
    def create_project_structure_visualization(self):
        """Create a text file showing the project structure"""
        structure_lines = ["Project Structure:", ""]
        
        # Build a tree structure
        all_paths = set()
        for file_path in self.created_files:
            path = Path(file_path)
            for i in range(len(path.parts)):
                all_paths.add(Path(*path.parts[:i+1]))
        
        # Sort paths for consistent output
        sorted_paths = sorted(all_paths)
        
        # Create tree visualization
        for path in sorted_paths:
            level = len(path.parts) - 1
            indent = "  " * level
            name = path.parts[-1]
            if path in [Path(f) for f in self.created_files]:
                structure_lines.append(f"{indent}├── {name}")
            else:
                structure_lines.append(f"{indent}├── {name}/")
        
        # Save structure visualization
        structure_path = Path(self.output_base_dir) / "project_structure.txt"
        with open(structure_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(structure_lines))
        
        print(f"\nProject structure saved to: {structure_path}")

def main():
    """Main function to run the parser"""
    print("React File Parser")
    print("="*60)
    
    # Get input file path
    input_file = input("Enter the path to the input file (default: 'react_app.txt'): ").strip()
    if not input_file:
        input_file = 'react_app.txt'
    
    # Check if file exists
    if not os.path.exists(input_file):
        print(f"Error: File '{input_file}' not found.")
        return
    
    # Get output directory
    output_dir = input("Enter output directory (default: current directory): ").strip()
    if not output_dir:
        output_dir = os.getcwd()
    
    # Ask about backup
    backup_choice = input("Create backup of existing files? (yes/no, default: yes): ").strip().lower()
    create_backup = backup_choice != 'no'
    
    # Confirm before proceeding
    print(f"\nConfiguration:")
    print(f"  Input file: {input_file}")
    print(f"  Output directory: {output_dir}")
    print(f"  Create backup: {create_backup}")
    
    confirm = input("\nDo you want to proceed? (yes/no): ").strip().lower()
    
    if confirm in ['yes', 'y']:
        try:
            # Create parser instance
            parser = ReactFileParser(input_file, output_dir)
            
            # Create files
            parser.create_files(backup=create_backup)
            
            # Print summary
            parser.print_summary()
            
            # Generate report
            parser.generate_report()
            
            # Create project structure visualization
            parser.create_project_structure_visualization()
            
            print("\nProcess completed successfully!")
            
        except Exception as e:
            print(f"\nError occurred: {str(e)}")
    else:
        print("Operation cancelled.")

if __name__ == "__main__":
    main()
