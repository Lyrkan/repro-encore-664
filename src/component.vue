<template lang="pug">
  div(style="width : 100%; position : relative;",:style="properties.style || {}")
      div(key="schema",v-if="properties != undefined",style="display : inherit;flex-flow : inherit;height:inherit;justify-content :inherit")
        label(v-if="type!= 'boolean' && nolabel == undefined && properties.title != ''", v-html='properties.title', style='display : block;')

        div.container(:class="type",v-if='properties != undefined')
          div(v-if="type == 'group'",v-for="(item,index) in group",:style="properties.groupStyle || {}",style="width: 100%; display: flex; align-items : center;padding-bottom : 8px;")
            span.material-icons(style="color : red; ",v-if="group.length > 1 && properties.attr != undefined && properties.attr.todo_style",@click="group.splice(index,1)") delete
            schemaform(v-for="(children,key) in properties.childrens",v-if="children.if == undefined || (children.if != undefined && group[index][children.if.split(' ')[0]] == children.if.split(' ')[1])",:key="key",:properties="children",v-model="group[index][key]")
          button.btn.btn-primary(v-if="type == 'group' && properties.attr != undefined && properties.attr.todo_style",@click="group.push({})")
            span.material-icons() add
          codemirror(v-if="type == 'code'",
                      @ready="onCmReady",
                      :options="codemirrorOptions",
                      ref="codemirror",
                      style="max-height : 100%",
                      :value='value',
                      @input='update')
          //Testo
          textarea.form-control(
                              :autofocus="$props.autofocus",
                              rows="1",
                              v-autosize="",
                              v-if="type == 'text'",
                             tabindex="0",
                              ref='text',
                              :value='value',
                              v-bind="properties.attr || {}", 
                              @input='update',
                              :maxlength='nomaxlenght == undefined ? properties.maxLength : false',
                              v-bind:required='properties.required == true',
                              type='text',
                              :placeholder='properties.title'
                              style="resize: none;padding : 8px 16px 8px 16px;min-height : 20px !important;max-height : 300px;",
                              :style="leftBorder")
          
          input.form-control(:autofocus="$props.autofocus",v-if="type == 'number'",v-bind="properties.attr || {}", ref='text', :value='value', @input='update', :maxlength='properties.maxLength', v-bind:required='properties.required == true', type='number', :placeholder='properties.title')

          //Integer
          input.form-control(:autofocus="$props.autofocus",
                              v-if="type == 'integer'",
                              v-bind="properties.attr || {}",
                              ref='integer', 
                              value='value', 
                              @input='update',
                              :maxlength='properties.maxLength',
                              v-bind:required='properties.required == true',
                              type='integer',
                              :placeholder='properties.title',
                              :style="leftBorder")
          
          .ranger(v-if="type == 'range'",:style="{left : `${_value}%`}") {{_value}}
          input.slider(v-if="type == 'range'",
                              v-bind="properties.attr || {}", 
                              ref='range',
                              :value='value',
                              @input='update',
                              min="0",
                              max="100",
                              v-bind:required='properties.required == true', 
                              type='range')
          //mapdraw
          input.form-control.mapdraw(v-if="type == 'mapdraw'",:style="leftBorder",  v-bind="properties.attr || {}",  ref='integer', :value='value', @input='update', :maxlength='properties.maxLength', v-bind:required='properties.required == true',v-mapdraw="", type='integer', :placeholder='properties.title')
          span.mapdraw(v-if="type == 'mapdraw' && value != ''") 
            i.fa.fa-edit.pr-1
            | edit
          //typeahead
          //div.typeahead(v-if="type == 'typeahead'",v-click-outside="typeaheadClose")
            input.form-control( ref='typeahead',@focus="typeahead",@input='typeahead', v-model='typeaheadModel',:maxlength='properties.maxLength', v-bind:required='properties.required == true', type='integer', :placeholder='properties.title')
            .form-control-feedback(v-if='busy && value.length > 0', style='position : absolute;right : 0px;')
              i.icon-spinner2.spinner
            div.typeahead_container(v-if="typeaheadResults.length > 0",@scroll="typeaheadScroll($event)")
              div.typeahead_item(v-for="(item,index) in typeaheadResults",:key="index",@click="selectTypeahead(item)")
                p {{item.title}}
          // Testo unico
          //.position-relative.unique(v-if="type == 'uniquetext' && _value!= undefined")
              .input-group
                input.form-control(ref='uniquetext', :class="[valid && _value.length > 0 ? 'border-success' : '',!valid && _value.length > 0 ? 'border-danger' : '']", :value='_value', @input='update', :maxlength='properties.maxLength', v-bind:required='properties.required == true', type='text', :placeholder='properties.title')
              .form-control-feedback(v-if='!busy && _value.length > 0', style='position : absolute;right : 0px;', :class="valid ? 'text-success' : 'text-danger'")
                i(:class="valid ? 'icon-checkmark-circle' : 'icon-cancel-circle2'")
              .form-control-feedback(v-if='busy && _value.length > 0', style='position : absolute;right : 0px;')
                i.icon-spinner2.spinner
          // SELECT
          select.form-control(ref='select',:style="leftBorder", @input='update', :value='value', v-if="type=='select'",v-bind="properties.attr || {}", )
            option(value='')
            option(v-for='(e,enum_index) in properties.enum', :key='enum_index', v-bind:value='e', v-html='properties.enum_titles[enum_index]')
          // CHECKBOX
          div.apple-switch-container(v-if="type=='boolean'")
            input.apple-switch(type='checkbox', ref='checkbox', :value='value',:checked="value == true ? true : false" @input='update')
            | {{properties.title}}
          div(ref='radio', @input='update', :value='value', v-if="type=='radio'", style="display : inherit;height : 100%; flex-flow : column; justify-content :space-between" )
            div(v-for='(e,enum_index) in properties.enum', :key='enum_index', v-bind:value='e')
              input(:id="`radio${e}`",:name="uuid",type="radio",:value="e",@input='update(e)',:checked="value == e ? true : false")
              label(:for="`radio${e}`") {{properties.enum_titles[enum_index]}}
          
          //DATETIME
          input.form-control(:autofocus="$props.autofocus",:style="leftBorder",v-if="type == 'date'", ref='text', locale="it", v-datepicker="" ,dateformat="dd-mm-yyyy", :value='value', @input='update', :maxlength='properties.maxLength', v-bind:required='properties.required == true', type='integer', :placeholder='properties.title')
          
          vue-instant(v-if="type == 'typeahead'"
                      suggestion-attribute='label',
                      v-model='value',
                      :disabled='false',
                      @input='changed',
                      @selected='selected',
                      :show-autocomplete='true', 
                      :autofocus='false' , 
                      :suggestions='suggestions', 
                      name='customName', 
                      placeholder='custom placeholder', 
                      type='google')

      div.shine(key="shimmer",v-if="properties == undefined || loading == true")


</template>


<script>
import DatePicker from "vue2-datepicker";
import autosize from "v-autosize";

export default {
  directives: {
    autosize
  },
  components: {
    DatePicker
  },
  name: "schemaform",
  props: [
    "properties",
    "value",
    "nolabel",
    "button",
    "name",
    "options",
    "nomaxlenght",
    "noleftborder",
    "autofocus",
  ],
  data() {
    return {
      codemirrorOptions:
        this.properties.codemirrorOptions == undefined
          ? {
              styleActiveLine: true,
              lineNumbers: true,
              autoCloseTags: true,
              line: true,
              lint: true,
              hint : true,
              gutters: ["CodeMirror-lint-markers"],
              mode: "text/x-php",
              theme: "one-dark"
            }
          : this.properties.codemirrorOptions,
      uuid: this.$webilly.utils.rfcUUID(),
      group: [],
      datetime: "",
      valid: false,
      busy: false,
      loading: false,
      inverseDatepicker: false
    };
  },
  computed: {
    leftBorder : function(){
      if (this.$props.noleftborder === true) {
        return {
          "border-top-left-radius" : "0px",
          "border-bottom-left-radius" : "0px"
        }
      }else{
        return {}
      }
    },
    _value: function() {
      return this.value ? this.value : "";
    },
    type: function() {
      if (this.properties == undefined) {
        return false;
      }
      if (this.properties.type == "integer") {
        if (this.properties.widget == "range") {
          return "range";
        } else {
          return "integer";
        }
      }
      if (this.properties.type == "radio") {
        return "radio";
      }
      if (this.properties.type == "typeahead") {
        return "typeahead";
      }
      if (this.properties.type == "number") {
        return "number";
      }
      if (this.properties.type == "code") {
        return "code";
      }
      if (this.properties.type == "group") {
        return "group";
      }
      if (
        this.properties.type == "string" &&
        this.properties.widget != "date" &&
        this.properties.enum == undefined
      ) {
        if (
          this.properties.attr != undefined &&
          this.properties.attr.type == "typeahead"
        ) {
          return "typeahead";
        } else {
          if (this.properties.unique) {
            return "uniquetext";
          } else {
            if (
              this.properties.attr != undefined &&
              this.properties.attr.type == "mapdraw"
            ) {
              return "mapdraw";
            } else {
              return "text";
            }
          }
        }
      }
      if (
        this.properties.type == "string" &&
        this.properties.widget != "date" &&
        this.properties.enum != undefined
      ) {
        return "select";
      }
      if (this.properties.type == "boolean") {
        return "boolean";
      }
      if (
        this.properties.type == "string" &&
        this.properties.widget == "date"
      ) {
        return "date";
      }
      return false;
    }
  },
  mounted: function() {
    //this.instantiateTypeahead();
    this.$nextTick(() => {
      window.addEventListener("resize", () => {
        if (this.type == "date" || this.type == "typeahead") {
          this.computePosition();
        }
      });
      if (this.type != "code" && this.type != "group" && this.type != "radio") {
        this.update();
      }
      if (this.type == "group") {
        if (this.value == undefined || this.value == "") {
          this.group.push({});
        } else {
          this.group = this.value;
        }
      }
      this.$forceUpdate();
    });
  },
  methods: {
    onCmReady(cm) {
      cm.setSize("100%", null);
    },
    computePosition: function() {
      try {
        let el = this.$refs[this.type].$el;
        var rect = el.getBoundingClientRect();
        if (rect.top > window.innerHeight / 2) {
          this.inverseDatepicker = true;
        } else {
          this.inverseDatepicker = false;
        }
      } catch (e) {}

      //console.log(rect.top, window.innerHeight);
    },
    update: async function(input) {
      try {
        switch (this.type) {
          case "typeahead":
            if (input == undefined) {
              return;
            }
            this.$emit("input", input);
            break;
          case "group":
            let group = _.flatten(input.map(v => Object.values(v))).filter(
              v => v != "" && v != undefined
            );
            console.log(group);
            if (group.length == 0) {
              this.$emit("input", "");
            } else {
              this.$emit("input", input);
            }

            break;
          case "text":
            this.$emit("input", this.$refs.text.value);
            break;
          case "radio":
            this.$emit("input", input.srcElement.value);
            break;
          case "code":
            this.$emit("input", input);
            break;
          case "number":
            this.$emit("input", this.$refs.text.value);
            break;
          case "integer":
            this.$emit("input", this.$refs.integer.value);
            break;
          case "range":
            this.$emit(
              "input",
              new Number(`${this.$refs.range.value}`)
            ); /*
            this.$forceUpdate();*/
            console.log(this.$refs.range.value);
            break;
          case "uniquetext":
            this.$emit("input", this.$refs.uniquetext.value);

            if (!this.$refs.uniquetext.value) {
              return;
            }
            console.log(
              "CONSOLE LOG UNIQUE",
              `${this.properties.path}/${this.$refs.uniquetext.value}`
            );

            let r = await this.$http.get(
              `${this.properties.path}/${this.$refs.uniquetext.value}`
            );
            //console.log(`${this.properties.path}/${this.$refs.uniquetext.value}`);
            if (!r.body.exists) {
              this.valid = true;
            } else {
              if (r.body.owner != undefined && r.body.owner == this.$root.id) {
                this.valid = true;
              } else {
                this.valid = false;
              }
            }

            break;
          case "select":
            this.$emit("input", this.$refs.select.value);
            break;
          case "boolean":
            this.$emit("input", this.$refs.checkbox.checked);
            break;
          case "date":
            this.$emit("input", this.$refs.text.value);
            break;
        }
      } catch (e) {
        console.log(e);
      }
    },

    search: function() {}
  },
  created: function() {
    VueCodemirror.CodeMirror.defineMode("htmltwig", function(
      config,
      parserConfig
    ) {
      return VueCodemirror.CodeMirror.overlayMode(
        VueCodemirror.CodeMirror.getMode(config, "twig"),
        VueCodemirror.CodeMirror.getMode(
          config,
          parserConfig.backdrop || "text/html"
        )
      );
    });
  },
  watch: {
    value: function(v) {
      if (this.type == "uniquetext") {
        if (!this.$refs.uniquetext.value) {
          console.log("HAHAHAHAHHAHHAHAAHAHH", v);
          this.$nextTick(() => {
            this.update();
          });
        }
        //this.update();
      }
    },
    group: {
      deep: true,
      handler(v) {
        this.update(v);
      }
    }
  }
};
</script>
