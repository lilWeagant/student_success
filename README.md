# Student Success Project

This repository includes code segments from my work with the Ontario Tech University student dataset. This work was conducted as part of my Master's thesis and includes elements of data science, information visualization, and user experience research and design.

## random_forest_model.py

Queries a MySQL database to train a scikit-learn random forest classifier model and saves the model for future use.

## beeswarm.html
Pending...

## beeswarm.js
Pending...

## sampling_technique.py

This script uses a normal distribution and random sampling to select and assign probable grades to selected courses. This process involved a few steps which I have described with some modified python code below. I used pandas for storage and manipulation, and numpy for math and statistics.

1. Set up a normal distribution across all cumulative GPAs in the dataset. First I load the student grade data into a pandas dataframe directly from a MySQL database.
```Python
conn = MySQLdb.connect(host='', user='', passwd='', db='')
query = "SELECT * FROM studentdata_semester_view;"
df_student_grades = pd.read_sql(query, conn)
```

  Each row in the dataframe are the grade records for one student. We iterate over each row and select the valid grade/GPA values. Since -4.3 is a valid grade value (F) and 4.3 is the maximum value, we need to select values between -4.3 and 4.3 excluding 0. -4.3 will mess up the mean calculation and is replaced with 0 in the grade array.

  ```Python
#pull all grade scenarios for each student
#cumulative semester GPAs
grade_array = []
for x in range(len(df_student_grades)):
    student = df_student_grades.iloc[x] #select a single row (student) from data
    for y in range(len(student)):
        if student[y] != 0 and student[y] <= 4.3:
            if s[y] == -4.3: #Check if value is equal to -4.3 and replace with 0
                grade_array.append(0)
            else:
                grade_array.append(student[y])
```
  The following function makes it easier to use SciPy truncnorm (full credit: shorturl.at/abipK). I use this function to get my final sampling distribution.

  ```Python
  def get_truncated_normal(mean=0, sd=1, low=0, upp=10):
      return truncnorm(
          (low - mean) / sd, (upp - mean) / sd, loc=mean, scale=sd)
```
  ```Python
  mu, std = norm.fit(cgpa_arr) #fit normal curve to array of student_stds (std_arr)
  dist = get_truncated_normal(mean = mu, sd = std, low = 0, upp = 4.3)
  X = dist.rvs(10000)

  dist_params = {'mu': [mu], 'std': [std]}
  dist_params = pd.DataFrame.from_dict(dist_params)
```
