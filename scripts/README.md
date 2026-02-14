# RightToCompare | Developer Utilities & Scripts

This folder contains internal tools for database management, account administration, and development environment setup.

---

## General Setup (Required for all tools)

All scripts in this directory share the same environment requirements.

1. **Python 3.10+** & **Virtual Environment**:

   ```bash
   python -m .venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

2. Install Dependencies
   `pip install -r requirements.txt`

3. Environment Variables
   Ensure that your .env in the root of the scripts/ folder. The .env should contain:
   - MONGO_URI=\[\MongoDB_connection_url\*]
   - DB_NAME=test

## Tools

### Phone Database Populator

- This utility populates the DB with a set of random mock phones.

#### Usage

`python3 populate_phone.py --numPhones [NUM_PHONES] --clear`

| Flag        | Description                                                 |
| :---------- | :---------------------------------------------------------- |
| --numPhones | Number of mock phones to generate (Default: 12).            |
| --clear     | Destructive. Wipes the phones collection before populating. |

#### Examples

```python
# Wipe phone collection then seed 50 phones
python3 populate_phone.py --numPhones 50 --clear

# Update/Add 50 phones without deleting existing ones
python3 populate_phone.py --numPhones 50
```
