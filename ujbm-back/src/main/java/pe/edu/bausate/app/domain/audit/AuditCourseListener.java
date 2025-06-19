package pe.edu.bausate.app.domain.audit;

import jakarta.persistence.PostLoad;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PostUpdate;
import jakarta.persistence.PreRemove;
import pe.edu.bausate.app.domain.models.Course;

public class AuditCourseListener {

    private Course currentValue;

    @PostLoad
    public void postLoad(Course entity) {
        System.out.println("Post Load");
//        this.currentValue = SerializationUtils.clone(entity);
    }

    @PostPersist
    @PostUpdate
    public void onPostPersist(Course entity) {
        System.out.println("Post persist or update");
        System.out.println("Old Value: " + this.currentValue);
        System.out.println("New Value: " + entity.toString());
    }

    @PreRemove
    public void onPreDelete(Course entity) {
        System.out.println(entity.toString());
    }

}
